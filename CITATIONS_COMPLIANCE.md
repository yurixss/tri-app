# Medical and Health Information Citations - Compliance Documentation

## Overview
This document outlines the updates made to address Guideline 1.4.1 (Safety - Physical Harm) regarding the inclusion of citations for medical and health information in the Tri-App.

## Changes Made

### 1. New Citations Utility File
**File:** `utils/citations.ts`

Created a comprehensive citations utility that includes:
- **Nutrition Citations**: References for carbohydrate intake, sodium/electrolyte replacement, protein requirements, and hydration guidelines
- **Training Zones Citations**: References for cycling power zones, running pace zones, and swimming pace zones

All citations include:
- Organization/Author names
- Specific document/publication titles
- Direct links to sources where available
- Descriptive text explaining the scientific basis for each calculation

### 2. New Sources Info Component
**File:** `components/SourcesInfo.tsx`

A reusable React Native component that:
- Displays all medical and health citations in an organized format
- Includes disclaimer text warning users to consult professionals
- Provides clickable links to source materials
- Shows category grouping (Nutrition, Training Zones)
- Features a responsive layout suitable for all device sizes

### 3. Updated Nutrition Calculator
**File:** `app/(tabs)/nutrition.tsx`

Enhancements:
- Added "ℹ️ Fontes" (Sources) button in the header
- Implemented modal dialog for displaying nutrition citations
- Modal shows all four nutrition calculation categories:
  - Carbohydrates (30-60g/hour based on intensity)
  - Sodium/Electrolytes (500-700mg/hour)
  - Protein (0.3g per kg body weight)
  - Hydration (500ml/hour base, adjusted for weight and intensity)

### 4. Updated Training Zone Screens
Updated all three sport-specific training zone calculators:

#### Cycling (`app/screens/bike.tsx`)
- Added sources button for power zone calculations
- Citations reference Hunter Allen & Andrew Coggan's "Training and Racing with a Power Meter"
- Explains FTP (Functional Threshold Power) methodology

#### Running (`app/screens/run.tsx`)
- Added sources button for pace zone calculations
- Citations reference Jack Daniels' "Running Formula" and ACSM guidelines
- Explains vVO2max (velocity at VO2max) methodology

#### Swimming (`app/screens/swim.tsx`)
- Added sources button for pace zone calculations
- Citations reference USA Swimming and SwimSmooth guidelines
- Explains CSS (Critical Swim Speed) methodology

## Citations Included

### Nutrition Sources
1. **International Society of Sports Nutrition (ISSN)** - Position Stands on:
   - Nutrition and Athletic Performance
   - Hydration and Physical Performance
   - Protein and Exercise

2. **American College of Sports Medicine (ACSM)** - Guidelines on:
   - Nutrition and Athletic Performance
   - Exertional Heat Illness
   - Exercise and Fluid Replacement

### Training Zones Sources
1. **Cycling**: Hunter Allen & Andrew Coggan, TrainingPeaks
2. **Running**: Jack Daniels, ACSM Guidelines
3. **Swimming**: USA Swimming, SwimSmooth

## User Experience

### How Users Access Citations

1. **Nutrition Calculator**
   - Navigate to "Calculadora de Nutrição" tab
   - Click "ℹ️ Fontes" button in header
   - Modal appears with all nutrition sources

2. **Training Zones**
   - Navigate to any sport (Bike, Run, or Swim)
   - Click "ℹ️ Fontes" button in header
   - Modal appears with relevant training zone sources

### Disclaimers Included

All citation modals include:
- Warning that information is educational only
- Recommendation to consult healthcare professionals before making significant changes
- Clear attribution of calculation methodologies

## Calculation Methodology Documentation

### Nutrition Calculations

#### Carbohydrates
- **Low intensity**: 30g/hour
- **Moderate intensity**: 45g/hour
- **High intensity**: 60g/hour
- Adjusted for body weight (normalized to 70kg reference)
- Gender adjustment applied (males: +10%)

#### Sodium
- **Low intensity**: 500mg/hour
- **Moderate intensity**: 600mg/hour
- **High intensity**: 700mg/hour
- Adjusted for body weight
- Temperature adjustment: +10% increase per 5°C above 25°C

#### Protein
- Post-workout: 0.3g per kg body weight
- Promotes muscle protein synthesis when consumed within hours of training

#### Hydration
- Base: 500ml/hour
- Intensity adjustments:
  - Low: 1.0x multiplier
  - Moderate: 1.2x multiplier
  - High: 1.5x multiplier
- Weight-based adjustments
- Temperature adjustments: +10% per 5°C above 25°C

### Training Zone Calculations

#### Cycling (Power Zones)
- **Zone 1 (Active Recovery)**: < 55% FTP
- **Zone 2 (Endurance)**: 56-75% FTP
- **Zone 3 (Tempo)**: 76-90% FTP
- **Zone 4 (Threshold)**: 91-105% FTP
- **Zone 5 (VO2 Max)**: 106-120% FTP
- **Zone 6 (Anaerobic)**: 121-150% FTP
- **Zone 7 (Neuromuscular)**: > 150% FTP

#### Running (Pace Zones)
- Based on 3km or 5km test times
- Calculated using vVO2max methodology
- Five intensity zones from Easy/Recovery to VO2 Max

#### Swimming (Pace Zones)
- Based on 200m or 400m critical swim speed tests
- Adjustment factor for distance variation
- Five intensity zones from Easy/Recovery to Speed

## Compliance Notes

✅ **All medical/health calculations now include citations**
✅ **Users can easily access source materials via in-app links**
✅ **Clear disclaimers included in all citation modals**
✅ **Scientific methodology documented and traceable**
✅ **Calculation parameters based on established guidelines (ISSN, ACSM)**

## Testing Recommendations

1. **Nutrition Screen Tests**
   - Verify sources button appears and functions
   - Test modal opening/closing
   - Verify all links are clickable and functional

2. **Training Zone Screen Tests**
   - Test sources button on bike.tsx
   - Test sources button on run.tsx
   - Test sources button on swim.tsx
   - Verify each modal shows sport-specific sources

3. **Content Tests**
   - Verify all links open to valid external sources
   - Check that disclaimers are clearly visible
   - Ensure responsive layout on various device sizes

## Future Enhancements

Potential improvements for future versions:
1. Add in-app citation viewing without external links (for offline support)
2. Add academic paper PDFs for reference
3. Create "About Our Calculations" FAQ section
4. Add version history for calculation methodology changes
5. Include feedback mechanism for citation accuracy

---

**Date Created:** January 11, 2026
**Guideline Addressed:** 1.4.1 - Safety - Physical Harm
**Status:** ✅ Compliance Achieved
