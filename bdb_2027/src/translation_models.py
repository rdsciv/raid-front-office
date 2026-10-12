"""
Statistical Translation Engine & Model Evaluation for Combine-to-NFL Linkages.
Compares conventional stopwatch models against 10 Hz kinematic tracking models,
computes incremental predictive power (Delta R^2, AIC/BIC, Likelihood Ratio Tests),
and isolates front-office draft inefficiencies (Sleepers vs. Bust Traps).
"""

import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy import stats


def evaluate_archetype_translation(df, target_col, trad_col, kin_col, draft_col="draft_pick"):
    """
    Fits nested regression models:
    - Model 1 (Baseline / Conventional): target ~ trad_drill + draft_pick
    - Model 2 (Enhanced / 10 Hz Tracking): target ~ trad_drill + draft_pick + kin_metric
    
    Computes rigorous goodness-of-fit statistics, delta R^2, AIC/BIC, and LRT p-value.
    """
    # Prepare data matrix
    cols = [target_col, trad_col, kin_col, draft_col]
    clean_df = df[cols].dropna().copy()
    
    y = clean_df[target_col]
    
    # Model 1: Baseline
    X_base = sm.add_constant(clean_df[[trad_col, draft_col]])
    res_base = sm.OLS(y, X_base).fit()
    
    # Model 2: Enhanced with 10 Hz Kinematics
    X_enh = sm.add_constant(clean_df[[trad_col, draft_col, kin_col]])
    res_enh = sm.OLS(y, X_enh).fit()
    
    # Goodness of fit
    r2_base = res_base.rsquared
    r2_enh = res_enh.rsquared
    delta_r2 = r2_enh - r2_base
    
    aic_base = res_base.aic
    aic_enh = res_enh.aic
    delta_aic = aic_enh - aic_base # Negative value favors enhanced model
    
    bic_base = res_base.bic
    bic_enh = res_enh.bic
    delta_bic = bic_enh - bic_base
    
    # Likelihood Ratio Test (nested models)
    # LRT = 2 * (llf_enh - llf_base)
    lrt_stat = 2.0 * (res_enh.llf - res_base.llf)
    df_diff = res_enh.df_model - res_base.df_model
    lrt_pvalue = stats.chi2.sf(lrt_stat, df_diff)
    
    # Kinematic coefficient significance
    kin_coef = res_enh.params[kin_col]
    kin_pval = res_enh.pvalues[kin_col]
    kin_tstat = res_enh.tvalues[kin_col]
    
    # Front-Office Quadrant Classification
    # Compare z-scores of traditional drill vs kinematic metric
    trad_z = stats.zscore(clean_df[trad_col])
    # Note: for times like 40-yd or shuttle, lower is better, so invert z
    if "time" in trad_col.lower() or "shuttle" in trad_col.lower() or "cone" in trad_col.lower() or "yd" in trad_col.lower():
        trad_score = -trad_z
    else:
        trad_score = trad_z
        
    kin_score = stats.zscore(clean_df[kin_col])
    
    classifications = []
    for ts, ks in zip(trad_score, kin_score):
        if ts >= 0.0 and ks >= 0.0:
            classifications.append("Verified Alpha (High Speed / High Mechanics)")
        elif ts < 0.0 and ks >= 0.2:
            classifications.append("Hidden Sleeper (Avg Stopwatch / Elite Mechanics)")
        elif ts >= 0.2 and ks < 0.0:
            classifications.append("Bust Risk Trap (Blistering Speed / Flawed Mechanics)")
        else:
            classifications.append("Low Ceiling / Sub-replacement")
            
    clean_df["scouting_classification"] = classifications
    clean_df["trad_zscore"] = trad_score
    clean_df["kin_zscore"] = kin_score
    clean_df["predicted_target_base"] = res_base.predict(X_base)
    clean_df["predicted_target_enh"] = res_enh.predict(X_enh)
    clean_df["actual_target"] = y
    
    return {
        "res_base": res_base,
        "res_enh": res_enh,
        "r2_base": r2_base,
        "r2_enh": r2_enh,
        "delta_r2": delta_r2,
        "aic_base": aic_base,
        "aic_enh": aic_enh,
        "delta_aic": delta_aic,
        "bic_base": bic_base,
        "bic_enh": bic_enh,
        "delta_bic": delta_bic,
        "lrt_stat": lrt_stat,
        "lrt_pvalue": lrt_pvalue,
        "kin_coef": kin_coef,
        "kin_pval": kin_pval,
        "kin_tstat": kin_tstat,
        "evaluated_df": clean_df
    }
