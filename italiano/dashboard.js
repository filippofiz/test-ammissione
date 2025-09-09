import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const studentId = sessionStorage.getItem("selectedStudentId");
const studentName = sessionStorage.getItem("selectedStudentName");
const globalTestType = sessionStorage.getItem("selectedTestType");
document.getElementById("dashboardTitle").textContent = `Results for ${studentName}`;

if (!studentId) {
  alert("Error: No student selected.");
  window.location.href = "tutor_dashboard.html";
}

// Global variables for fetched data and chart instances.
let globalAnswers = [];
let globalQuestions = [];
let studentTestsData = [];
let chartInstances = {};

// Update tutor name in header
async function updateTutorName() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session) {
    const userId = sessionData.session.user.id;
    const { data: tutor } = await supabase
      .from("tutors")
      .select("name")
      .eq("auth_uid", userId)
      .single();
    
    if (tutor?.name) {
      const userNameElement = document.querySelector('.user-name');
      if (userNameElement) {
        userNameElement.textContent = tutor.name;
      }
    }
  }

  // Add logout event
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  });
}

// Calculate simulation score estimate with advanced statistics
async function calculateSimulationEstimate() {
  // Get all tests where tipologia_esercizi = "Test"
  const simulationTests = studentTestsData.filter(test => 
    test.tipologia_esercizi === "Test" && test.status === "completed"
  );
  
  if (simulationTests.length === 0) {
    document.getElementById("simulationEstimate").style.display = "none";
    return;
  }
  
  // Get all test IDs for simulations
  const simulationTestIds = simulationTests.map(test => test.id);
  
  // Get all answers for these simulation tests
  const simulationAnswers = globalAnswers.filter(ans => 
    simulationTestIds.includes(ans.test_id)
  );
  
  // Group answers by test_id to calculate score per simulation
  const scoresByTest = {};
  const testsWithTime = [];
  
  simulationTestIds.forEach(testId => {
    const testAnswers = simulationAnswers.filter(ans => ans.test_id === testId);
    if (testAnswers.length > 0) {
      // Calculate score using standard modality (1 point for correct, 0 for others)
      const score = testAnswers.reduce((acc, ans) => {
        return acc + (ans.auto_score === 1 ? 1 : 0);
      }, 0);
      
      // Find earliest submission time
      const earliestTime = testAnswers.reduce((min, ans) => {
        return (!min || ans.submitted_at < min) ? ans.submitted_at : min;
      }, null);
      
      const data = {
        score: score,
        total: testAnswers.length,
        percentage: (score / testAnswers.length) * 100,
        time: earliestTime,
        testId: testId
      };
      
      scoresByTest[testId] = data;
      testsWithTime.push(data);
    }
  });
  
  // Sort by time for chronological analysis
  testsWithTime.sort((a, b) => a.time.localeCompare(b.time));
  
  const scores = Object.values(scoresByTest);
  if (scores.length === 0) {
    document.getElementById("simulationEstimate").style.display = "none";
    return;
  }
  
  // Statistical calculations
  const allScores = scores.map(s => s.score);
  const allPercentages = scores.map(s => s.percentage);
  const n = allScores.length;
  
  // Mean and Median
  const mean = allScores.reduce((a, b) => a + b, 0) / n;
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const median = n % 2 === 0
    ? (sortedScores[n / 2 - 1] + sortedScores[n / 2]) / 2
    : sortedScores[Math.floor(n / 2)];
  
  // Variance and Standard Deviation
  const variance = allScores.reduce((acc, score) => {
    return acc + Math.pow(score - mean, 2);
  }, 0) / (n - 1); // Using sample variance (n-1)
  const stdDev = Math.sqrt(variance);
  const stdError = stdDev / Math.sqrt(n);
  
  // Coefficient of Variation
  const coefficientOfVariation = (stdDev / mean) * 100;
  
  // Confidence Intervals (95% and 68%)
  // Using t-distribution for small samples
  const tValue95 = getTValue(n - 1, 0.95);
  const tValue68 = getTValue(n - 1, 0.68);
  
  const ci95Lower = mean - (tValue95 * stdError);
  const ci95Upper = mean + (tValue95 * stdError);
  const ci68Lower = mean - (tValue68 * stdError);
  const ci68Upper = mean + (tValue68 * stdError);
  
  // Value at Risk (VaR) - 5th percentile
  const var5 = getPercentile(sortedScores, 5);
  const var10 = getPercentile(sortedScores, 10);
  
  // Expected Shortfall (Conditional VaR)
  const scoresBelow5th = allScores.filter(s => s <= var5);
  const expectedShortfall = scoresBelow5th.length > 0 
    ? scoresBelow5th.reduce((a, b) => a + b, 0) / scoresBelow5th.length 
    : var5;
  
  // Trend Analysis with Linear Regression
  let trend = { slope: 0, interpretation: "Stabile", confidence: "Bassa" };
  if (n >= 3) {
    const regression = calculateLinearRegression(testsWithTime);
    trend = regression;
  }
  
  // Calculate weighted average (exponential weighting for recency)
  let weightedSum = 0;
  let weightTotal = 0;
  testsWithTime.forEach((test, index) => {
    const weight = Math.exp(index / n); // Exponential weight
    weightedSum += test.score * weight;
    weightTotal += weight;
  });
  const weightedAvg = weightedSum / weightTotal;
  
  // Outlier Detection using IQR method
  const q1 = getPercentile(sortedScores, 25);
  const q3 = getPercentile(sortedScores, 75);
  const iqr = q3 - q1;
  const outlierLowerBound = q1 - 1.5 * iqr;
  const outlierUpperBound = q3 + 1.5 * iqr;
  const outliers = scores.filter(s => 
    s.score < outlierLowerBound || s.score > outlierUpperBound
  );
  
  // Bootstrap for robust estimates (if enough data)
  let bootstrapEstimates = null;
  if (n >= 5) {
    bootstrapEstimates = performBootstrap(allScores, 1000);
  }
  
  // Check for high variability even without statistical outliers
  if (outliers.length === 0 && n <= 5 && coefficientOfVariation > 30) {
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);
    const range = maxScore - minScore;
    
    // If range is more than 50% of max score, show variability alert
    if (range > maxScore * 0.5) {
      const variabilityAlert = document.createElement('div');
      variabilityAlert.innerHTML = `
        <div style="background: rgba(251, 191, 36, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; font-weight: 600; margin-bottom: 0.5rem;">
            ⚠️ Alta Variabilità nei Risultati
          </h4>
          <div style="color: rgba(255,255,255,0.9);">
            <p>I punteggi variano significativamente: da <strong>${minScore}</strong> a <strong>${maxScore}</strong> punti.</p>
            <p style="font-size: 0.85rem; margin-top: 0.5rem;">
              Con solo ${n} simulazioni, questa variabilità è statisticamente accettabile ma indica prestazioni inconsistenti.
            </p>
            <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.8;">
              💡 <strong>Consiglio:</strong> Completare almeno 5-6 simulazioni per avere stime più affidabili e identificare meglio eventuali anomalie.
            </p>
          </div>
        </div>
      `;
      
      // Insert after the timeline chart
      setTimeout(() => {
        const outlierAlertDiv = document.getElementById("outlierAlert");
        outlierAlertDiv.innerHTML = variabilityAlert.innerHTML;
        outlierAlertDiv.style.display = "block";
      }, 200);
    }
  }
  
  // Performance Stability Index
  const stabilityIndex = calculateStabilityIndex(testsWithTime);
  
  // Calculate interval width based on sample size and variability
  const intervalWidth = calculateDynamicInterval(n, coefficientOfVariation, stdDev);
  
  // Update UI Elements
  updateBasicStats(mean, median, weightedAvg, n, var5, trend, stabilityIndex);
  updateAdvancedStats(ci95Lower, ci95Upper, ci68Lower, ci68Upper, var10, expectedShortfall, coefficientOfVariation);
  updateFinalEstimate(mean, median, weightedAvg, intervalWidth, n, trend, bootstrapEstimates);
  
  // Add timeline chart
  const simulationGrid = document.querySelector('.simulation-estimate .simulation-grid');
  const timelineContainer = createSimulationTimeline(testsWithTime);
  simulationGrid.parentNode.insertBefore(timelineContainer, document.getElementById("outlierAlert"));
setTimeout(() => initTimelineChart(testsWithTime, mean, weightedAvg, intervalWidth), 100);  // Show outlier alert if needed
  if (outliers.length > 0) {
    showOutlierAlert(outliers, outlierLowerBound, outlierUpperBound);
  }
  
  // Show the estimation card
  document.getElementById("simulationEstimate").style.display = "block";
}

// Helper Functions

function getTValue(df, confidence) {
  // Approximation for t-distribution critical values
  const tTable = {
    0.68: { 1: 1.84, 2: 1.32, 3: 1.20, 4: 1.14, 5: 1.11, 10: 1.05, 20: 1.03, 30: 1.02 },
    0.95: { 1: 12.71, 2: 4.30, 3: 3.18, 4: 2.78, 5: 2.57, 10: 2.23, 20: 2.09, 30: 2.04 }
  };
  
  if (df >= 30) return confidence === 0.95 ? 1.96 : 1.0;
  if (df >= 20) return tTable[confidence][20];
  if (df >= 10) return tTable[confidence][10];
  if (df >= 5) return tTable[confidence][5];
  return tTable[confidence][Math.min(df, 5)];
}

function getPercentile(sortedArray, percentile) {
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (lower === upper) return sortedArray[lower];
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

function calculateLinearRegression(testsWithTime) {
  const n = testsWithTime.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  testsWithTime.forEach((test, index) => {
    sumX += index;
    sumY += test.score;
    sumXY += index * test.score;
    sumX2 += index * index;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  let ssTotal = 0, ssResidual = 0;
  
  testsWithTime.forEach((test, index) => {
    const yPred = slope * index + intercept;
    ssTotal += Math.pow(test.score - yMean, 2);
    ssResidual += Math.pow(test.score - yPred, 2);
  });
  
  const rSquared = 1 - (ssResidual / ssTotal);
  
  // Interpret trend
  let interpretation = "Stabile";
  let confidence = "Bassa";
  
  if (rSquared > 0.7) confidence = "Alta";
  else if (rSquared > 0.4) confidence = "Media";
  
  if (Math.abs(slope) > 0.5 && confidence !== "Bassa") {
    interpretation = slope > 0 ? "Miglioramento" : "Peggioramento";
  }
  
  return { slope, intercept, rSquared, interpretation, confidence };
}

function performBootstrap(data, iterations) {
  const bootstrapMeans = [];
  const n = data.length;
  
  for (let i = 0; i < iterations; i++) {
    const sample = [];
    for (let j = 0; j < n; j++) {
      sample.push(data[Math.floor(Math.random() * n)]);
    }
    const mean = sample.reduce((a, b) => a + b, 0) / n;
    bootstrapMeans.push(mean);
  }
  
  bootstrapMeans.sort((a, b) => a - b);
  
  return {
    mean: bootstrapMeans.reduce((a, b) => a + b, 0) / iterations,
    ci95Lower: getPercentile(bootstrapMeans, 2.5),
    ci95Upper: getPercentile(bootstrapMeans, 97.5),
    ci68Lower: getPercentile(bootstrapMeans, 16),
    ci68Upper: getPercentile(bootstrapMeans, 84)
  };
}

function calculateStabilityIndex(testsWithTime) {
  if (testsWithTime.length < 2) return { value: "N/A", label: "Dati insufficienti" };
  
  // Calculate moving range
  let sumMovingRange = 0;
  for (let i = 1; i < testsWithTime.length; i++) {
    sumMovingRange += Math.abs(testsWithTime[i].score - testsWithTime[i-1].score);
  }
  const avgMovingRange = sumMovingRange / (testsWithTime.length - 1);
  const avgScore = testsWithTime.reduce((sum, t) => sum + t.score, 0) / testsWithTime.length;
  
  const stabilityRatio = avgMovingRange / avgScore;
  
  if (stabilityRatio < 0.1) return { value: stabilityRatio.toFixed(3), label: "Eccellente" };
  if (stabilityRatio < 0.2) return { value: stabilityRatio.toFixed(3), label: "Buona" };
  if (stabilityRatio < 0.3) return { value: stabilityRatio.toFixed(3), label: "Media" };
  return { value: stabilityRatio.toFixed(3), label: "Bassa" };
}

function calculateDynamicInterval(n, cv, stdDev) {
  // Base interval width - starts at 5 and decreases with more data
  let baseWidth = 5;
  
  // Adjust for sample size - smaller intervals with more simulations
  if (n >= 20) baseWidth = 2;
  else if (n >= 15) baseWidth = 2.5;
  else if (n >= 10) baseWidth = 3;
  else if (n >= 7) baseWidth = 3.5;
  else if (n >= 5) baseWidth = 4;
  else if (n >= 3) baseWidth = 4.5;
  // n < 3 keeps baseWidth = 5
  
  // Small adjustment for very high variability only
  if (cv > 40) baseWidth *= 1.2;
  
  return baseWidth;
}

function updateBasicStats(mean, median, weightedAvg, n, var5, trend, stabilityIndex) {
  document.getElementById("estimatedScore").textContent = mean.toFixed(1);
  document.getElementById("estimatedPercentage").textContent = `valore atteso`;  document.getElementById("medianScore").textContent = median.toFixed(1);
  document.getElementById("weightedScore").textContent = weightedAvg.toFixed(1);
  document.getElementById("simulationCount").textContent = n;
  
  // Update VaR display
  document.getElementById("scoreRange").textContent = var5.toFixed(1);
  document.getElementById("stdDeviation").textContent = `punteggio minimo probabile`;
  
  // Update trend with confidence - FIXED OVERFLOW
  const trendElement = document.getElementById("scoreTrend");
  const trendColors = {
    "Miglioramento": "#10b981",
    "Peggioramento": "#ef4444",
    "Stabile": "#6b7280"
  };
  
  // Shorter text to prevent overflow
  const trendSymbols = {
    "Miglioramento": "↑",
    "Peggioramento": "↓",
    "Stabile": "→"
  };
  
  const trendText = {
    "Miglioramento": "In crescita",
    "Peggioramento": "In calo",
    "Stabile": "Stabile"
  };
  
  trendElement.innerHTML = `
    <span style="color: ${trendColors[trend.interpretation]};">
      ${trendSymbols[trend.interpretation]} ${trendText[trend.interpretation]}
    </span>
    <div style="font-size: 0.7rem; opacity: 0.7; margin-top: 0.2rem;">${trend.confidence}</div>
  `;
  
  // Update consistency with stability index
  const consistencyElement = document.getElementById("consistency");
  const stabilityColors = {
    "Eccellente": "#10b981",
    "Buona": "#22c55e",
    "Media": "#f59e0b",
    "Bassa": "#ef4444",
    "Dati insufficienti": "#6b7280"
  };
  consistencyElement.innerHTML = `
    <span style="color: ${stabilityColors[stabilityIndex.label]};">${stabilityIndex.label}</span>
  `;
}

function updateAdvancedStats(ci95Lower, ci95Upper, ci68Lower, ci68Upper, var10, expectedShortfall, cv) {
  // Remove this function - we don't want to add extra stats
  // Keep the display cleaner
}

function updateFinalEstimate(mean, median, weightedAvg, intervalWidth, n, trend, bootstrap) {
  const lowerBound = Math.round(weightedAvg - intervalWidth / 2);
  const upperBound = Math.round(weightedAvg + intervalWidth / 2);
  
  let confidenceLevel = "Bassa";
  if (n >= 10) confidenceLevel = "Alta";
  else if (n >= 5) confidenceLevel = "Media";
  
  document.getElementById("finalEstimate").innerHTML = `
    <h3 style="color: rgb(28, 37, 69); margin-bottom: 1rem; font-size: 1.2rem; position: relative; z-index: 1;">
      📊 INTERVALLO DI PRESTAZIONE PROBABILE
    </h3>
    
    <div id="interval-box" style="
      text-align: center; 
      margin-bottom: 1rem;
      cursor: pointer;
      padding: 1.5rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, rgba(0, 166, 102, 0.05) 0%, rgba(28, 37, 69, 0.05) 100%);
      border: 1px solid rgba(0, 166, 102, 0.3);
      position: relative;
      z-index: 1;
    " onmouseover="this.style.background='linear-gradient(135deg, rgba(0, 166, 102, 0.1) 0%, rgba(28, 37, 69, 0.1) 100%)'; this.style.borderColor='#00a666'" 
       onmouseout="this.style.background='linear-gradient(135deg, rgba(0, 166, 102, 0.05) 0%, rgba(28, 37, 69, 0.05) 100%)'; this.style.borderColor='rgba(0, 166, 102, 0.3)'">
      <div style="font-size: 3.5rem; font-weight: 800; color:rgb(28, 37, 69); line-height: 1; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);">
        ${lowerBound} - ${upperBound}
      </div>
      <div style="font-size: 1rem; margin-top: 0.5rem; color: rgb(28, 37, 69); font-weight: 500;">
        Range basato su ${n} simulazioni
      </div>
      <div style="font-size: 0.75rem; margin-top: 0.3rem; color: #64748b;">
        🔍 Clicca per vedere come è calcolato
      </div>
    </div>
    
    <div style="font-size: 0.85rem; line-height: 1.6; color: #475569; position: relative; z-index: 1;">
      <strong style="color: rgb(28, 37, 69);">Nota:</strong> Questo intervallo rappresenta il range di punteggi più probabile.
      ${n < 5 ? "With more simulations the interval will become more precise." : ""}
    </div>
  `;
  
  // Add click handler for interval methodology
  setTimeout(() => {
    const intervalBox = document.getElementById('interval-box');
    if (intervalBox) {
      intervalBox.addEventListener('click', () => {
        showMethodologyModal({
          title: 'Calcolo Intervallo di Prestazione',
  description: `
          <div style="line-height: 1.8;">
            <p style="margin-bottom: 1rem;">
              L'intervallo rappresenta il <strong>range di punteggi più probabile</strong> per il prossimo test, 
              calcolato con un approccio statistico adattivo che bilancia precisione e utilità pratica.
            </p>
            
            <h4 style="color: #00a666; margin-bottom: 0.5rem; font-size: 1.1rem;">📊 Come funziona il calcolo</h4>
            
            <p style="margin-bottom: 0.5rem;"><strong>Punto centrale:</strong> Media pesata di ${weightedAvg.toFixed(1)} punti</p>
            <p style="margin-bottom: 1rem;"><strong>Ampiezza base:</strong> ±${(intervalWidth/2).toFixed(1)} punti</p>
            
            <h4 style="color: #00a666; margin-bottom: 0.5rem; font-size: 1.1rem;">📈 Precisione progressiva</h4>
            <p style="margin-bottom: 0.5rem;">L'intervallo si <strong>restringe</strong> con più simulazioni completate:</p>
            <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
              <li><strong>1-2 simulazioni:</strong> ±2.5 punti (massima incertezza)</li>
              <li><strong>3-4 simulazioni:</strong> ±2.25 punti</li>
              <li><strong>5-6 simulazioni:</strong> ±2 punti</li>
              <li><strong>7-9 simulazioni:</strong> ±1.75 punti</li>
              <li><strong>10-14 simulazioni:</strong> ±1.5 punti</li>
              <li><strong>15-19 simulazioni:</strong> ±1.25 punti</li>
              <li><strong>20+ simulazioni:</strong> ±1 punto (massima precisione)</li>
            </ul>
            
            <h4 style="color: #00a666; margin-bottom: 0.5rem; font-size: 1.1rem;">⚠️ Aggiustamento per alta variabilità</h4>
            <p style="margin-bottom: 1rem;">
              Se i tuoi punteggi sono <strong>molto irregolari</strong> (coefficiente di variazione >40%), 
              l'intervallo viene <strong>ampliato del 20%</strong> per riflettere questa incertezza aggiuntiva.
              <br><em style="color: #64748b; font-size: 0.9rem;">
              Esempio: se ottieni 10, 25, 12, 28 punti, i risultati sono troppo variabili per fare previsioni strette.
              </em>
            </p>
            
            <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; border-left: 4px solid #00a666;">
              <p style="margin: 0;">
                <strong>Il tuo stato attuale:</strong><br>
                ✓ ${n} simulazioni completate<br>
                ✓ Livello di confidenza: <strong>${confidenceLevel}</strong><br>
                ✓ Intervallo attuale: <strong>${lowerBound} - ${upperBound}</strong> punti
              </p>
            </div>
            
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #64748b; font-style: italic;">
              💡 <strong>Suggestion:</strong> ${n < 5 ? 'Complete at least 5-6 simulations for more reliable estimates.' : n < 10 ? 'With ' + (10-n) + ' more simulations you will reach "High" confidence level.' : 'You have reached an excellent number of simulations for reliable estimates!'}
            </p>
          </div>
        `
      });
    });
  }
  }, 100);
}

// Add methodology tooltips
function addMethodologyTooltips() {
  const methodologies = {
    'media-box': {
      title: 'Media Aritmetica',
      description: 'Sum of all scores divided by the number of simulations. Represents the expected central value but can be influenced by extreme results.'
    },
    'mediana-box': {
      title: 'Mediana', 
      description: 'The central value when scores are ordered. More robust than the mean because it is not affected by extreme values.'
    },
    'simulazioni-box': {
      title: 'Numero Simulazioni',
      description: 'Total completed tests. More simulations = more reliable estimates and tighter intervals.'
    },
    'var-box': {
      title: 'Value at Risk (5%)',
      description: 'The score you have a 95% chance of exceeding. Useful for understanding the statistically probable "worst case".'
    },
    'trend-box': {
      title: 'Analisi Trend',
      description: 'Basata su regressione lineare delle ultime simulazioni. La confidenza dipende dal coefficiente R² (>0.7 = Alta, >0.4 = Media).'
    },
    'consistenza-box': {
      title: 'Indice di Consistenza',
      description: 'Measures result stability based on average Moving Range. Excellent = variations <10%, Good <20%, Average <30%, Low >30%.'
    }
  };
  
  // Add click handlers
  Object.keys(methodologies).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.cursor = 'pointer';
      element.style.transition = 'all 0.3s ease';
      
      element.addEventListener('click', () => {
        showMethodologyModal(methodologies[id]);
      });
      
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
      });
    }
  });
}

// Show methodology modal
function showMethodologyModal(methodology) {
  // Remove existing modal if any
  const existingModal = document.getElementById('methodology-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.id = 'methodology-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 16px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    ">
      <h3 style="color: #1c2545; margin-bottom: 1rem; font-size: 1.4rem;">
        📊 ${methodology.title}
      </h3>
      <p style="color: #4a5568; line-height: 1.6;">
        ${methodology.description}
      </p>
      <button onclick="this.closest('#methodology-modal').remove()" style="
        margin-top: 1.5rem;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
        Chiudi
      </button>
    </div>
  `;
  
  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.body.appendChild(modal);
}

// Add timeline chart for simulation results
function createSimulationTimeline(testsWithTime) {
  const chartContainer = document.createElement('div');
  chartContainer.className = 'timeline-container';
  chartContainer.style.cssText = 'grid-column: 1 / -1;';
  
  chartContainer.innerHTML = `
    <h3>📈 Andamento Cronologico Simulazioni</h3>
    <div id="simulationTimelineChart" style="width: 100%; height: 200px;"></div>
  `;
  
  return chartContainer;
}

// Initialize timeline chart with ECharts
function initTimelineChart(testsWithTime, mean, weightedAvg, intervalWidth) {
  const chartDom = document.getElementById('simulationTimelineChart');
  if (!chartDom) return;
  
  const timelineChart = echarts.init(chartDom);
  
  // Prepare data
  const dates = testsWithTime.map(test => {
    const date = new Date(test.time);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  });
  
  const scores = testsWithTime.map(test => test.score);
  
  // Add future projection
  const lastDate = new Date(testsWithTime[testsWithTime.length - 1].time);
  const futureDate = new Date(lastDate);
  futureDate.setDate(futureDate.getDate() + 7); // +7 giorni
  dates.push(futureDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }));
  
  // Calculate bounds for visualization
  const lowerBound = Math.round(weightedAvg - intervalWidth / 2);
  const upperBound = Math.round(weightedAvg + intervalWidth / 2);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      top: 40,
      right: 80,
      bottom: 40,
      left: 60
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { 
        color: '#64748b',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      min: Math.max(0, Math.min(minScore, lowerBound) - 5),
      max: Math.max(maxScore, upperBound) + 5,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { 
        color: '#64748b',
        fontSize: 11
      },
      splitLine: { lineStyle: { color: '#f1f5f9' } }
    },
    series: [
      {
        name: 'Punteggi effettivi',
        data: scores,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: {
          color: '#3b82f6',
          width: 3
        },
        itemStyle: {
          color: '#3b82f6',
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{c}',
          color: '#1e293b',
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      {
        name: 'Stima futura',
        type: 'line',
        data: [...scores.slice(0, -1).map(() => null), scores[scores.length - 1], weightedAvg],
        lineStyle: {
          color: '#8b5cf6',
          width: 2,
          type: 'dashed'
        },
        symbol: 'none',
        symbolSize: 0
      },
      {
        name: 'Range previsto',
        type: 'line',
        data: [...scores.map(() => null), upperBound],
        lineStyle: {
          color: 'transparent'
        },
        areaStyle: {
          color: 'rgba(59, 130, 246, 0.1)'
        },
        symbol: 'none',
        stack: 'confidence',
        silent: true
      },
      {
        name: 'Range previsto min',
        type: 'line',
        data: [...scores.map(() => null), lowerBound],
        lineStyle: {
          color: 'transparent'
        },
        areaStyle: {
          color: 'transparent'
        },
        symbol: 'none',
        stack: 'confidence',
        silent: true
      },
      {
        name: 'Punto stima',
        type: 'scatter',
        data: [[dates.length - 1, weightedAvg]],
        symbolSize: 12,
        itemStyle: {
          color: '#8b5cf6',
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: `Stima: ${Math.round(weightedAvg)}`,
          position: 'top',
          color: '#8b5cf6',
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      {
        name: 'Range markers',
        type: 'scatter',
        data: [
          [dates.length - 1, upperBound],
          [dates.length - 1, lowerBound]
        ],
        symbol: 'rect',
        symbolSize: [40, 3],
        itemStyle: {
          color: '#8b5cf6'
        },
        label: {
          show: true,
          formatter: function(params) {
            return params.value[1] === upperBound ? upperBound : lowerBound;
          },
          position: function(params) {
            return params.value[1] === upperBound ? 'top' : 'bottom';
          },
          color: '#64748b',
          fontSize: 10
        }
      }
    ],
    markLine: {
      data: [
        {
          yAxis: mean,
          name: 'Media',
          label: {
            formatter: `Media: ${mean.toFixed(1)}`,
            position: 'end',
            color: '#94a3b8',
            fontSize: 10
          },
          lineStyle: {
            color: '#cbd5e1',
            type: 'dashed',
            width: 1
          }
        }
      ]
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#1e293b' },
      formatter: function(params) {
        const dataIndex = params[0].dataIndex;
        if (dataIndex < testsWithTime.length) {
          const test = testsWithTime[dataIndex];
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">${params[0].name}</div>
            <div>Punteggio: <strong>${params[0].value}</strong></div>
            <div style="color: #64748b;">Percentuale: ${test.percentage.toFixed(1)}%</div>
          `;
        } else {
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">Previsione prossimo test</div>
            <div>Stima centrale: <strong>${Math.round(weightedAvg)}</strong></div>
            <div>Range atteso: <strong>${lowerBound} - ${upperBound}</strong></div>
            <div style="color: #64748b; font-size: 11px;">Basato su ${testsWithTime.length} simulazioni</div>
          `;
        }
      }
    }
  };
  
  timelineChart.setOption(option);
  
  // Resize on window resize
  window.addEventListener('resize', () => timelineChart.resize());
  
  return timelineChart;

}
async function loadDashboard() {
  // Update tutor name after a delay to ensure header is loaded
  setTimeout(updateTutorName, 200);

  
  // Make sure all filters are visible.
  document.getElementById("sectionFilter").style.display = "inline-block";
  document.getElementById("tipologiaFilter").style.display = "inline-block";
  document.getElementById("progressivoFilter").style.display = "inline-block";
  document.getElementById("argomentoFilter").style.display = "inline-block";

  // Determine answer and question tables based on globalTestType.
  const answerTable = globalTestType.includes("PDF")
    ? "student_answers"
    : "studentbocconi_answers";
  const questionTable = globalTestType.includes("PDF")
    ? "questions"
    : "questions_bancaDati";

  // Fetch student answers including the submitted_at timestamp.
  const { data: answers, error: answersError } = await supabase
    .from(answerTable)
    .select("answer, auto_score, question_id, submitted_at, test_id")
    .eq("auth_uid", studentId);
  if (answersError) {
    console.error("❌ Error fetching student answers:", answersError.message);
    return;
  }

  // Fetch questions.
  const { data: questions, error: questionsError } = await supabase
    .from(questionTable)
    .select("id, section, tipologia_esercizi, progressivo, argomento")
    .eq("tipologia_test", globalTestType);
  if (questionsError) {
    console.error("❌ Error fetching questions:", questionsError.message);
    return;
  }

  globalAnswers = answers;
  globalQuestions = questions;

  // Fetch student_tests data.
  const { data: testsData, error: testsError } = await supabase
    .from("student_tests")
    .select("section, tipologia_esercizi, progressivo, status, id")
    .eq("auth_uid", studentId)
    .eq("tipologia_test", globalTestType);
  if (testsError) {
    console.error("❌ Error fetching student_tests data:", testsError.message);
    return;
  }
  studentTestsData = testsData;

  // Calculate simulation estimate AFTER loading all data
  await calculateSimulationEstimate();
  // Add event listeners for methodology tooltips
  setTimeout(addMethodologyTooltips, 100);

  populateFiltersFromStudentTests(studentTestsData);

  document.getElementById("sectionFilter").addEventListener("change", () => {
    populateDependentFilters();
    updateAllVisualizations();
  });
  document.getElementById("tipologiaFilter").addEventListener("change", updateAllVisualizations);
  document.getElementById("progressivoFilter").addEventListener("change", updateAllVisualizations);
  document.getElementById("argomentoFilter").addEventListener("change", updateAllVisualizations);
  document.getElementById("linePlotArgomentoFilter").addEventListener("change", updateLineChart);

  updateAllVisualizations();
  populateLinePlotFilter();
}

function updateAllVisualizations() {
  filterDashboard();
  updateInteractiveTable();
  updateLineChart();
  updateRadarChart();
  updateBarChart();
  updateHeatmap();
}

function populateFiltersFromStudentTests(testsData) {
  const sectionFilter = document.getElementById("sectionFilter");
  const tipologiaFilter = document.getElementById("tipologiaFilter");
  const progressivoFilter = document.getElementById("progressivoFilter");
  const argomentoFilter = document.getElementById("argomentoFilter");

  const completedTests = testsData.filter(test => test.status === "completed");

  sectionFilter.innerHTML = `<option value="all">All Sections</option>`;
  tipologiaFilter.innerHTML = `<option value="all">All Types</option>`;
  progressivoFilter.innerHTML = `<option value="all">All Progressives</option>`;
  argomentoFilter.innerHTML = `<option value="all">All Topics</option>`;

  const sections = Array.from(new Set(completedTests.map(test => test.section)));
  const tipologie = Array.from(new Set(completedTests.map(test => test.tipologia_esercizi)));
  const progressivi = Array.from(new Set(completedTests.map(test => test.progressivo)));

  sections.forEach(s => {
    sectionFilter.innerHTML += `<option value="${s}">${s}</option>`;
  });
  tipologie.forEach(t => {
    tipologiaFilter.innerHTML += `<option value="${t}">${t}</option>`;
  });
  progressivi.forEach(p => {
    progressivoFilter.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

function populateDependentFilters() {
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaFilter = document.getElementById("tipologiaFilter");
  const progressivoFilter = document.getElementById("progressivoFilter");
  const argomentoFilter = document.getElementById("argomentoFilter");

  let filteredTests = studentTestsData.filter(test => test.status === "completed");
  if (sectionVal !== "all") {
    filteredTests = filteredTests.filter(test => test.section.toString() === sectionVal);
  }

  tipologiaFilter.innerHTML = `<option value="all">All Types</option>`;
  progressivoFilter.innerHTML = `<option value="all">All Progressives</option>`;
  const tipologie = Array.from(new Set(filteredTests.map(test => test.tipologia_esercizi)));
  const progressivi = Array.from(new Set(filteredTests.map(test => test.progressivo)));
  tipologie.forEach(t => {
    tipologiaFilter.innerHTML += `<option value="${t}">${t}</option>`;
  });
  progressivi.forEach(p => {
    progressivoFilter.innerHTML += `<option value="${p}">${p}</option>`;
  });

  let filteredQuestions = globalQuestions;
  if (sectionVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.section.toString() === sectionVal);
  }
  argomentoFilter.innerHTML = `<option value="all">All Topics</option>`;
  const argomenti = Array.from(new Set(filteredQuestions.map(q => q.argomento).filter(a => a)));
  argomenti.forEach(a => {
    argomentoFilter.innerHTML += `<option value="${a}">${a}</option>`;
  });
}

function filterDashboard() {
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaVal = document.getElementById("tipologiaFilter").value;
  const progressivoVal = document.getElementById("progressivoFilter").value;
  const argomentoVal = document.getElementById("argomentoFilter").value;
  const scoreDisplay = document.getElementById("scoreDisplay");
  const scoreDisplay2 = document.getElementById("scoreDisplay2");

  let filteredTests = studentTestsData.filter(test => test.status === "completed");
  if (sectionVal !== "all") {
    filteredTests = filteredTests.filter(q => q.section.toString() === sectionVal);
  }
  if (tipologiaVal !== "all") {
    filteredTests = filteredTests.filter(q => Number(q.tipologia_esercizi) === Number(tipologiaVal));
  }
  if (progressivoVal !== "all") {
    filteredTests = filteredTests.filter(q => Number(q.progressivo) === Number(progressivoVal));
  }

  let filteredQuestions = globalQuestions;
  if (sectionVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.section.toString() === sectionVal);
  }
  if (argomentoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.argomento.toString() === argomentoVal);
  }
  if (progressivoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => Number(q.progressivo) === Number(progressivoVal));
  }
  
  const allowedQuestionIds = new Set(filteredQuestions.map(q => q.id));
  const filteredAnswers = globalAnswers.filter(ans => allowedQuestionIds.has(ans.question_id));
  
  // Count answers
  let correctCount = 0, incorrectCount = 0, insicuroCount = 0, nonHoIdeaCount = 0, nonDatoCount = 0;
  filteredAnswers.forEach(d => {
    if (d.auto_score === 1) {
      correctCount++;
    } else if (d.auto_score === 0 && !["x", "y", "z"].includes(d.answer)) {
      incorrectCount++;
    } else if (d.answer === "x") {
      insicuroCount++;
    } else if (d.answer === "y") {
      nonHoIdeaCount++;
    } else {
      nonDatoCount++;
    }
  });
  
  // Update stats cards
  const totalAnswers = filteredAnswers.length;
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("incorrectCount").textContent = incorrectCount;
  document.getElementById("correctPercentage").textContent = totalAnswers > 0 ? 
    `${((correctCount / totalAnswers) * 100).toFixed(1)}% of total` : "0% of total";
  document.getElementById("incorrectPercentage").textContent = totalAnswers > 0 ? 
    `${((incorrectCount / totalAnswers) * 100).toFixed(1)}% of total` : "0% of total";
  
  // Update completion rate
  const totalQuestions = filteredQuestions.length;
  const completionRate = totalQuestions > 0 ? ((totalAnswers / totalQuestions) * 100).toFixed(1) : 0;
  document.getElementById("completionRate").textContent = `${completionRate}%`;
  document.getElementById("progressFill").style.width = `${completionRate}%`;
  
  // Update pie chart
  updateEChartsPie(correctCount, incorrectCount, insicuroCount, nonHoIdeaCount, nonDatoCount);

  // Calculate and display scores
  if (
    sectionVal != "all" &&
    tipologiaVal != "all" &&
    progressivoVal != "all" &&
    argomentoVal === "all"
  ) {
    const score = calculateScore(filteredAnswers, 1);
    const score2 = calculateScore(filteredAnswers, 2);
    document.getElementById("totalScore").textContent = score.toFixed(2);
    scoreDisplay.textContent = `Modalità standard (${score})`;
    scoreDisplay2.textContent = `Score (1 for correct, -0.25 for incorrect, 0 otherwise): ${score2}`;
    scoreDisplay2.style.display = "block";
  } else {
    const score = calculateScore(filteredAnswers, 1);
    document.getElementById("totalScore").textContent = score.toFixed(2);
    scoreDisplay.textContent = "Standard mode";
    scoreDisplay2.style.display = "none";
  }
}

function calculateScore(answers, modality) {
  let score = 0;
  answers.forEach(ans => {
    if (modality === 1) {
      score += ans.auto_score === 1 ? 1 : 0;
    } else if (modality === 2) {
      if (ans.auto_score === 1) {
        score += 1;
      } else if (ans.auto_score === 0 && !["x", "y", "z"].includes(ans.answer)) {
        score -= 0.25;
      }
    }
  });
  return score;
}

function updateEChartsPie(correctCount, incorrectCount, insicuroCount, nonHoIdeaCount, nonDatoCount) {
  const chartDom = document.getElementById('echartsPieContainer');
  if (!chartInstances.pie) {
    chartInstances.pie = echarts.init(chartDom);
  }
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: 'Risposte',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: correctCount, name: 'Corretto', itemStyle: { color: '#10b981' } },
          { value: incorrectCount, name: 'Incorretto', itemStyle: { color: '#ef4444' } },
          { value: insicuroCount, name: 'Insicuro', itemStyle: { color: '#3b82f6' } },
          { value: nonHoIdeaCount, name: 'Non ho idea', itemStyle: { color: '#f59e0b' } },
          { value: nonDatoCount, name: 'Non dato', itemStyle: { color: '#6b7280' } }
        ]
      }
    ]
  };

  chartInstances.pie.setOption(option);
}

function updateBarChart() {
  const chartDom = document.getElementById('barChartContainer');
  if (!chartInstances.bar) {
    chartInstances.bar = echarts.init(chartDom);
  }
  
  // Get filtered data
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaVal = document.getElementById("tipologiaFilter").value;
  const progressivoVal = document.getElementById("progressivoFilter").value;
  const argomentoVal = document.getElementById("argomentoFilter").value;
  
  let filteredQuestions = globalQuestions;
  if (sectionVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.section.toString() === sectionVal);
  }
  if (argomentoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.argomento.toString() === argomentoVal);
  }
  if (progressivoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => Number(q.progressivo) === Number(progressivoVal));
  }
  
  const allowedQuestionIds = new Set(filteredQuestions.map(q => q.id));
  const filteredAnswers = globalAnswers.filter(ans => allowedQuestionIds.has(ans.question_id));
  
  // Group by argomento
  const argomentoStats = {};
  filteredQuestions.forEach(q => {
    if (!argomentoStats[q.argomento]) {
      argomentoStats[q.argomento] = { correct: 0, total: 0 };
    }
  });
  
  filteredAnswers.forEach(ans => {
    const question = filteredQuestions.find(q => q.id === ans.question_id);
    if (question) {
      argomentoStats[question.argomento].total++;
      if (ans.auto_score === 1) {
        argomentoStats[question.argomento].correct++;
      }
    }
  });
  
  const categories = Object.keys(argomentoStats);
  const correctPercentages = categories.map(cat => 
    argomentoStats[cat].total > 0 ? (argomentoStats[cat].correct / argomentoStats[cat].total * 100).toFixed(1) : 0
  );
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '% Corrette',
      max: 100
    },
    series: [{
      name: 'Percentuale Corrette',
      type: 'bar',
      data: correctPercentages,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10b981' },
          { offset: 1, color: '#059669' }
        ]),
        borderRadius: [8, 8, 0, 0]
      }
    }]
  };
  
  chartInstances.bar.setOption(option);
}

function updateRadarChart() {
  const chartDom = document.getElementById('radarChartContainer');
  if (!chartInstances.radar) {
    chartInstances.radar = echarts.init(chartDom);
  }
  
  // Get all argomenti and calculate performance
  const argomentoStats = {};
  globalQuestions.forEach(q => {
    if (!argomentoStats[q.argomento]) {
      argomentoStats[q.argomento] = { correct: 0, total: 0 };
    }
  });
  
  globalAnswers.forEach(ans => {
    const question = globalQuestions.find(q => q.id === ans.question_id);
    if (question) {
      argomentoStats[question.argomento].total++;
      if (ans.auto_score === 1) {
        argomentoStats[question.argomento].correct++;
      }
    }
  });
  
  const indicators = Object.keys(argomentoStats).map(arg => ({
    name: arg,
    max: 100
  }));
  
  const values = Object.keys(argomentoStats).map(arg => 
    argomentoStats[arg].total > 0 ? (argomentoStats[arg].correct / argomentoStats[arg].total * 100).toFixed(1) : 0
  );
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)']
        }
      }
    },
    series: [{
      name: 'Competenze',
      type: 'radar',
      data: [{
        value: values,
        name: 'Performance',
        itemStyle: {
          color: '#3b82f6'
        },
        lineStyle: {
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
          ])
        }
      }]
    }]
  };
  
  chartInstances.radar.setOption(option);
}

function updateHeatmap() {
  const chartDom = document.getElementById('heatmapContainer');
  if (!chartInstances.heatmap) {
    chartInstances.heatmap = echarts.init(chartDom);
  }
  
  // Create a matrix of section vs tipologia performance
  const sections = Array.from(new Set(globalQuestions.map(q => q.section)));
  const tipologie = Array.from(new Set(globalQuestions.map(q => q.tipologia_esercizi)));
  
  const data = [];
  sections.forEach((section, sIdx) => {
    tipologie.forEach((tipologia, tIdx) => {
      const questions = globalQuestions.filter(q => 
        q.section === section && q.tipologia_esercizi === tipologia
      );
      const questionIds = questions.map(q => q.id);
      const answers = globalAnswers.filter(a => questionIds.includes(a.question_id));
      
      if (answers.length > 0) {
        const correctRate = answers.filter(a => a.auto_score === 1).length / answers.length * 100;
        data.push([tIdx, sIdx, correctRate.toFixed(1)]);
      }
    });
  });
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      formatter: function(params) {
        return `${sections[params.value[1]]} - ${tipologie[params.value[0]]}: ${params.value[2]}%`;
      }
    },
    grid: {
      height: '70%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: tipologie,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'category',
      data: sections,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#ef4444', '#f59e0b', '#10b981']
      }
    },
    series: [{
      name: 'Performance',
      type: 'heatmap',
      data: data,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  
  chartInstances.heatmap.setOption(option);
}

function populateLinePlotFilter() {
  const lineFilter = document.getElementById("linePlotArgomentoFilter");
  lineFilter.innerHTML = "";
  lineFilter.innerHTML += `<option value="Totale">Total</option>`;
  const argomenti = Array.from(new Set(globalQuestions.map(q => q.argomento).filter(a => a)));
  argomenti.forEach(arg => {
    lineFilter.innerHTML += `<option value="${arg}">${arg}</option>`;
  });
}

function updateLineChart() {
  const chartDom = document.getElementById('lineChartContainer');
  if (!chartInstances.line) {
    chartInstances.line = echarts.init(chartDom);
  }
  
  let filteredAnswers = globalAnswers;
  const selectedLineArg = document.getElementById("linePlotArgomentoFilter").value;
  
  if (selectedLineArg !== "Totale") {
    const questionsMap = {};
    globalQuestions.forEach(q => { questionsMap[q.id] = q; });
    filteredAnswers = filteredAnswers.filter(ans => {
      const q = questionsMap[ans.question_id];
      return q && q.argomento && q.argomento.toString() === selectedLineArg;
    });
  }
  
  const groupedByTest = {};
  filteredAnswers.forEach(ans => {
    const testId = ans.test_id || "unknown";
    if (!groupedByTest[testId]) {
      groupedByTest[testId] = [];
    }
    groupedByTest[testId].push(ans);
  });

  const testGroups = [];
  for (let testId in groupedByTest) {
    const testAnswers = groupedByTest[testId];
    const earliest = testAnswers.reduce((min, curr) => {
      return (!min || curr.submitted_at < min) ? curr.submitted_at : min;
    }, null);
    testGroups.push({ testId, earliest });
  }

  testGroups.sort((a, b) => a.earliest.localeCompare(b.earliest));
  const sortedTestIds = testGroups.map(group => group.testId);

  const categories = ["Corretto", "Incorretto", "Insicuro", "Non ho idea", "Non dato"];
  const seriesData = {
    "Corretto": [],
    "Incorretto": [],
    "Insicuro": [],
    "Non ho idea": [],
    "Non dato": []
  };

  const xLabels = [];

  sortedTestIds.forEach(testId => {
    const answersForTest = groupedByTest[testId];
    let counts = [0, 0, 0, 0, 0];
    answersForTest.forEach(ans => {
      if (ans.auto_score === 1) {
        counts[0]++;
      } else if (ans.auto_score === 0 && !["x", "y", "z"].includes(ans.answer)) {
        counts[1]++;
      } else if (ans.answer === "x") {
        counts[2]++;
      } else if (ans.answer === "y") {
        counts[3]++;
      } else if (ans.answer === "z") {
        counts[4]++;
      }
    });
    const total = counts.reduce((a, b) => a + b, 0);
    const percentages = counts.map(c => total > 0 ? Number(((c / total) * 100).toFixed(0)) : 0);
    categories.forEach((cat, idx) => {
      seriesData[cat].push(percentages[idx]);
    });
    
    const testRecord = studentTestsData.find(t => String(t.id) === testId);
    if (testRecord) {
      const label = `${testRecord.section}\n${testRecord.tipologia_esercizi} ${testRecord.progressivo}`;
      xLabels.push(label);
    } else {
      xLabels.push(testId);
    }
  });

  const colorMap = {
    "Corretto": "#10b981",
    "Incorretto": "#ef4444",
    "Insicuro": "#3b82f6",
    "Non ho idea": "#f59e0b",
    "Non dato": "#6b7280"
  };

  const option = {
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: { 
      data: categories,
      bottom: '5%'
    },
    grid: {
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: {
        formatter: function(value) {
          return value;
        },
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: 'Percentuale (%)',
      max: 100
    },
    series: categories.map(cat => ({
      name: cat,
      type: 'line',
      data: seriesData[cat],
      smooth: true,
      itemStyle: { color: colorMap[cat] },
      lineStyle: { width: 2 },
      emphasis: {
        focus: 'series'
      }
    }))
  };
  
  chartInstances.line.setOption(option);
}

// Build header structure for interactive table
function buildHeaderStructureInt(questionsData) {
  const structure = {};
  questionsData.forEach(q => {
    if (!structure[q.section]) {
      structure[q.section] = {};
    }
    if (!structure[q.section][q.tipologia_esercizi]) {
      structure[q.section][q.tipologia_esercizi] = new Set();
    }
    structure[q.section][q.tipologia_esercizi].add(q.progressivo);
  });
  for (const section in structure) {
    for (const tipologia in structure[section]) {
      structure[section][tipologia] = Array.from(structure[section][tipologia]).sort((a, b) => a - b);
    }
  }
  return structure;
}

function buildHeaderDefinitionsInt(structure) {
  const headerDefs = [];
  const sections = Object.keys(structure).sort();
  sections.forEach(section => {
    const tipologie = Object.keys(structure[section]).sort();
    tipologie.forEach(tipologia => {
      structure[section][tipologia].forEach(progressivo => {
        headerDefs.push({ section, tipologia, progressivo });
      });
    });
  });
  return headerDefs;
}

function generateInteractiveTable(questionsData, answersData) {
  const container = document.getElementById("interactiveTableContainer");
  container.innerHTML = "";
  const table = document.createElement("table");
  const displayAll = true;

  const headerStructure = buildHeaderStructureInt(questionsData);
  const headerDefs = buildHeaderDefinitionsInt(headerStructure);

  const thead = document.createElement("thead");

  // Header Row 1: Sections
  const headerRow1 = document.createElement("tr");
  const emptyTh = document.createElement("th");
  emptyTh.rowSpan = 4;
  emptyTh.textContent = "";
  headerRow1.appendChild(emptyTh);

  Object.keys(headerStructure).sort().forEach(section => {
    let colCount = 0;
    const tipologie = headerStructure[section];
    for (const tipologia in tipologie) {
      colCount += tipologie[tipologia].length * (displayAll ? 5 : 1);
    }
    const th = document.createElement("th");
    th.textContent = section;
    th.colSpan = colCount;
    headerRow1.appendChild(th);
  });
  thead.appendChild(headerRow1);

  // Header Row 2: Tipologia
  const headerRow2 = document.createElement("tr");
  Object.keys(headerStructure).sort().forEach(section => {
    const tipologie = headerStructure[section];
    Object.keys(tipologie).sort().forEach(tipologia => {
      const colCount = tipologie[tipologia].length * (displayAll ? 5 : 1);
      const th = document.createElement("th");
      th.textContent = tipologia;
      th.colSpan = colCount;
      headerRow2.appendChild(th);
    });
  });
  thead.appendChild(headerRow2);

  // Header Row 3: Progressivo
  const headerRow3 = document.createElement("tr");
  Object.keys(headerStructure).sort().forEach(section => {
    const tipologie = headerStructure[section];
    Object.keys(tipologie).sort().forEach(tipologia => {
      tipologie[tipologia].forEach(progressivo => {
        const th = document.createElement("th");
        th.textContent = progressivo;
        th.colSpan = (displayAll ? 5 : 1);
        th.classList.add("double-border-right");
        headerRow3.appendChild(th);
      });
    });
  });
  thead.appendChild(headerRow3);

  // Header Row 4: Answers
  const headerRow4 = document.createElement("tr");
  headerDefs.forEach(() => {
    if (displayAll) {
      ["Corretto", "Incorretto", "Insicuro", "Non ho idea", "Non dato"].forEach(label => {
        const th = document.createElement("th");
        th.textContent = label;
        headerRow4.appendChild(th);
      });
    }
  });
  thead.appendChild(headerRow4);

  table.appendChild(thead);

  // Body
  const tbody = document.createElement("tbody");

  const answersMap = {};
  answersData.forEach(ans => {
    answersMap[ans.question_id] = ans;
  });

  const questionsMap = {};
  questionsData.forEach(q => {
    const key = q.section + "|" + q.tipologia_esercizi + "|" + q.progressivo + "|" + q.argomento;
    if (!questionsMap[key]) {
      questionsMap[key] = [];
    }
    questionsMap[key].push(q);
  });

  const argomenti = Array.from(new Set(questionsData.map(q => q.argomento))).sort();
  const totals = {};
  headerDefs.forEach((def, idx) => {
    totals[idx] = displayAll ? [0, 0, 0, 0, 0] : [0];
  });

  argomenti.forEach(argomento => {
    const tr = document.createElement("tr");
    const thArg = document.createElement("th");
    thArg.textContent = argomento;
    tr.appendChild(thArg);

    headerDefs.forEach((def, idx) => {
      const key = def.section + "|" + def.tipologia + "|" + def.progressivo + "|" + argomento;
      const counts = [0, 0, 0, 0, 0];

      if (questionsMap[key]) {
        questionsMap[key].forEach(q => {
          const ansRecord = answersMap[q.id];
          if (ansRecord) {
            if (ansRecord.auto_score === 1) counts[0]++;
            else if (ansRecord.answer === "x") counts[2]++;
            else if (ansRecord.answer === "y") counts[3]++;
            else if (ansRecord.answer === "z") counts[4]++;
            else counts[1]++;
          }
        });
      }

      const total = counts.reduce((a, b) => a + b, 0);

      if (displayAll) {
        for (let i = 0; i < 5; i++) {
          const td = document.createElement("td");
          if (total === 0) {
            td.textContent = "-";
          } else {
            if (counts[i] === 0) {
              td.textContent = "0";
            } else {
              td.textContent = `${counts[i]} (${((counts[i] / total) * 100).toFixed(0)}%)`;
            }
          }
          if (counts[i] > 0) {
            if (i === 0) td.classList.add("correct-light");
            if (i === 1) td.classList.add("incorrect-light");
            if (i === 2) td.classList.add("x-answer-light");
            if (i === 3) td.classList.add("y-answer-light");
            if (i === 4) td.classList.add("z-answer-light");
            totals[idx][i] += counts[i];
          }
          if (i === 4) {
            td.classList.add("double-border-right");
          }
          tr.appendChild(td);
        }
      }
    });
    tbody.appendChild(tr);
  });

  // Totals Row
  const totalTr = document.createElement("tr");
  const thTotal = document.createElement("th");
  thTotal.textContent = "Total";
  totalTr.appendChild(thTotal);

  headerDefs.forEach((def, idx) => {
    if (displayAll) {
      const sumTotal = totals[idx].reduce((a, b) => a + b, 0);
      for (let i = 0; i < 5; i++) {
        const td = document.createElement("td");
        if (sumTotal === 0) {
          td.textContent = "-";
        } else {
          if (totals[idx][i] > 0) {
            td.textContent = `${totals[idx][i]} (${((totals[idx][i] / sumTotal) * 100).toFixed(0)}%)`;
          } else {
            td.textContent = totals[idx][i];
          }
        }
        if (totals[idx][i] > 0) {
          if (i === 0) td.classList.add("corretto");
          if (i === 1) td.classList.add("incorretto");
          if (i === 2) td.classList.add("x-answer");
          if (i === 3) td.classList.add("y-answer");
          if (i === 4) td.classList.add("z-answer");
        }
        if (i === 4) {
          td.classList.add("double-border-right");
        }
        totalTr.appendChild(td);
      }
    }
  });

  tbody.appendChild(totalTr);
  table.appendChild(tbody);
  container.appendChild(table);
}

function filterInteractiveTable() {
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaVal = document.getElementById("tipologiaFilter").value;
  const progressivoVal = document.getElementById("progressivoFilter").value;
  const argomentoVal = document.getElementById("argomentoFilter").value;

  let filteredQuestions = globalQuestions.slice();
  if (sectionVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.section === sectionVal);
  }
  if (tipologiaVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.tipologia_esercizi === tipologiaVal);
  }
  if (progressivoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.progressivo === Number(progressivoVal));
  }
  if (argomentoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.argomento === argomentoVal);
  }
  const filteredAnswers = globalAnswers.filter(a => 
    filteredQuestions.some(q => q.id === a.question_id)
  );
  return { filteredQuestions, filteredAnswers };
}

function updateInteractiveTable() {
  const { filteredQuestions, filteredAnswers } = filterInteractiveTable();
  generateInteractiveTable(filteredQuestions, filteredAnswers);
}

function openReport() {
  // Salva il file HTML del report
  const reportHTML = 'student-report.html';
  window.open(reportHTML, '_blank', 'width=1200,height=800');
}

// Resize charts on window resize
window.addEventListener('resize', () => {
  Object.values(chartInstances).forEach(chart => {
    chart.resize();
  });
});

function showOutlierAlert(outliers, lowerBound, upperBound) {
  const outlierScores = outliers.map(o => o.score).join(", ");
  const outlierElement = document.getElementById("outlierAlert");
  
  outlierElement.innerHTML = `
    <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem; border: 1px solid rgba(239, 68, 68, 0.3);">
      <h4 style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">⚠️ Rilevamento Anomalie Statistiche</h4>
      <div style="color: rgba(255,255,255,0.9);">
        <p>Identificate ${outliers.length} prestazioni anomale: <strong>${outlierScores} punti</strong></p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">
          Range normale: ${lowerBound.toFixed(1)} - ${upperBound.toFixed(1)} (basato su IQR × 1.5)
        </p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.8;">
          Questi risultati sono stati identificati ma rimangono nell'analisi per non distorcere la valutazione complessiva.
        </p>
      </div>
    </div>
  `;
  outlierElement.style.display = "block";
}

// Questa riga già esiste nel tuo file:
loadDashboard();
indow.openReport = openReport;