#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Indonesia single-route evaluation wrapper"""

import sys
import os
import argparse
import json
import csv

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE)

from common import load_station_info, evaluate_sample

DEFAULT_STATION_INFO = os.path.join(BASE, 'data', 'station_info_indonesia.csv')
DEFAULT_INPUT = os.path.join(BASE, 'data', 'benchmark_indonesia_single_route_example.csv')


def main():
    parser = argparse.ArgumentParser(description='Indonesia Single-Route Evaluation')
    parser.add_argument('--input', type=str, default=DEFAULT_INPUT,
                        help='Input CSV path')
    parser.add_argument('--input_field', type=str, default='generate_results',
                        choices=['sft_label', 'generate_results'],
                        help='Evaluation field')
    parser.add_argument('--station_info', type=str, default=DEFAULT_STATION_INFO,
                        help='Station info CSV path')
    parser.add_argument('--sample_count', type=int, default=None,
                        help='Sample count limit')
    args = parser.parse_args()

    # Load Indonesian station data
    info = load_station_info(args.station_info)
    station_coordinates = {sid: (v['lat'], v['lng']) for sid, v in info.items()}
    next_hop = {sid: v['next_stop_ids'] for sid, v in info.items()}

    samples = []
    with open(args.input, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            samples.append(row)
    if args.sample_count:
        samples = samples[:args.sample_count]

    total_samples = len(samples)
    print("=" * 100)
    print(f"🇮🇩 Indonesia Single-Route Evaluation - {os.path.basename(args.input)}")
    print(f"   Field: {args.input_field} | Stations: {len(info)} | Samples: {total_samples}")
    print("=" * 100)

    all_results = []
    eval_errors = []

    for i, sample in enumerate(samples, 1):
        try:
            prompt_data = json.loads(sample['sft_prompt'])
            start_str = prompt_data.get('start', '')
            end_str = prompt_data.get('end', '')
            start_coords = [float(x) for x in start_str.split(',')] if start_str else [0.0, 0.0]
            end_coords = [float(x) for x in end_str.split(',')] if end_str else [0.0, 0.0]
            result = evaluate_sample(sample, args.input_field, next_hop, station_coordinates, start_coords, end_coords)
            result['index'] = i
            result['index_id'] = sample['index_id']
            all_results.append(result)
        except Exception as e:
            eval_errors.append((i, sample.get('index_id', ''), str(e)))

    # Round 1: Reachability
    print("\n── Round 1: Reachability ──")
    reachable_results = [r for r in all_results if r['reachable']]
    unreachable_results = [r for r in all_results if not r['reachable']]
    for r in unreachable_results:
        print(f"  Sample {r['index']}: unreachable ({r['reachable_reason']})")
    reachable_count = len(reachable_results)
    print(f"\n  Reachability: {reachable_count}/{total_samples} ({reachable_count/total_samples*100:.1f}%)")
    if eval_errors:
        print(f"  Errors: {len(eval_errors)}")

    # Round 2: Station Grounding & Distance Plausibility
    print("\n── Round 2: Station Grounding & Distance Plausibility ──")
    sg_pass = sum(1 for r in reachable_results if r['station_grounding'])
    dp_pass = sum(1 for r in reachable_results if r['distance_plausibility'])
    for r in reachable_results:
        if not r['station_grounding']:
            print(f"  Sample {r['index']}: SG fail ({r['station_grounding_reason']})")
        if not r['distance_plausibility']:
            print(f"  Sample {r['index']}: DP fail ({r['distance_plausibility_reason']})")
    print(f"  Station Grounding: {sg_pass}/{reachable_count}")
    print(f"  Distance Plausibility: {dp_pass}/{reachable_count}")

    # Round 3: Structural Consistency
    print("\n── Round 3: Structural Consistency (IoU + Expert Score) ──")
    if reachable_count > 0:
        line_iou_avg = sum(r['line_iou'] for r in reachable_results) / reachable_count
        station_iou_avg = sum(r['station_iou'] for r in reachable_results) / reachable_count
        iou_exact = [r for r in reachable_results if r['station_iou'] == 1.0]
        print(f"  Line IoU Avg: {line_iou_avg:.4f}")
        print(f"  Station IoU Avg: {station_iou_avg:.4f}")
        print(f"  Station IoU=1: {len(iou_exact)}/{reachable_count}")
    else:
        print("  No reachable samples, skipping")
        iou_exact = []

    # Round 4: Estimation Accuracy
    print("\n── Round 4: Estimation Accuracy ──")
    if iou_exact:
        dist_acc = sum(1 for r in iou_exact if r['dist_accurate'])
        time_acc = sum(1 for r in iou_exact if r['time_accurate'])
        fare_acc = sum(1 for r in iou_exact if r['fare_accurate'])
        overall_acc = sum(1 for r in iou_exact if r['overall_accurate'])
        dist_mape = [r['dist_mape'] for r in iou_exact if r['dist_mape'] is not None]
        time_mape = [r['time_mape'] for r in iou_exact if r['time_mape'] is not None]
        fare_mape = [r['fare_mape'] for r in iou_exact if r['fare_mape'] is not None]
        print(f"  Distance Accurate: {dist_acc}/{len(iou_exact)}")
        print(f"  Time Accurate: {time_acc}/{len(iou_exact)}")
        print(f"  Fare Accurate: {fare_acc}/{len(iou_exact)}")
        print(f"  Overall Accurate: {overall_acc}/{len(iou_exact)}")
        if dist_mape: print(f"  Distance MAPE: {sum(dist_mape)/len(dist_mape):.2f}%")
        if time_mape: print(f"  Time MAPE: {sum(time_mape)/len(time_mape):.2f}%")
        if fare_mape: print(f"  Fare MAPE: {sum(fare_mape)/len(fare_mape):.2f}%")
    else:
        print("  No exact-IoU samples, skipping")

    # Summary
    print("\n" + "=" * 100)
    print("SUMMARY")
    print("=" * 100)
    print(f"  Total Samples: {total_samples}")
    print(f"  Round 1 Reachability: {reachable_count}/{total_samples} ({reachable_count/total_samples*100:.1f}%)")
    if reachable_count > 0:
        print(f"  Round 2 SG: {sg_pass}/{reachable_count} | DP: {dp_pass}/{reachable_count}")
        print(f"  Round 3 Station IoU=1: {len(iou_exact)}/{reachable_count}")
    if iou_exact:
        print(f"  Round 4 Overall Accurate: {overall_acc}/{len(iou_exact)}")
    if eval_errors:
        print(f"  Errors: {len(eval_errors)}")


if __name__ == '__main__':
    main()
