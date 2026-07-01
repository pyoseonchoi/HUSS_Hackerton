import os
import pandas as pd
from typing import Dict

class GenerationLossService:
    @staticmethod
    def calculate_generation_loss(csv_path: str) -> Dict[str, float]:
        """
        Reads generation CSV log.
        Computes generation loss ratio: max(0, expected_kwh - actual_kwh) / expected_kwh.
        If a 'zone_code' column is present in the CSV, it computes zone-specific loss ratios.
        Otherwise, returns a dictionary with 'global' mapping to the overall average loss ratio.
        """
        results = {"global": 0.0}
        
        if not csv_path:
            return results
            
        full_path = os.path.join("app", csv_path)
        if not os.path.exists(full_path):
            return results
            
        try:
            df = pd.read_csv(full_path)
            
            # Validation
            if "expected_kwh" not in df.columns or "actual_kwh" not in df.columns:
                return results
                
            # Avoid division by zero
            df["expected_kwh"] = df["expected_kwh"].astype(float)
            df["actual_kwh"] = df["actual_kwh"].astype(float)
            
            df = df[df["expected_kwh"] > 0]
            if df.empty:
                return results
                
            # Calculate loss ratio
            df["loss_ratio"] = (df["expected_kwh"] - df["actual_kwh"]) / df["expected_kwh"]
            df["loss_ratio"] = df["loss_ratio"].clip(lower=0.0, upper=1.0)
            
            # Check for zone-specific column to support expansion
            if "zone_code" in df.columns:
                zone_groups = df.groupby("zone_code")["loss_ratio"].mean()
                for zone, score in zone_groups.items():
                    results[str(zone)] = float(score)
                    
            # Calculate global average loss ratio
            results["global"] = float(df["loss_ratio"].mean())
            
        except Exception as e:
            print(f"Error parsing generation CSV: {e}")
            
        return results
