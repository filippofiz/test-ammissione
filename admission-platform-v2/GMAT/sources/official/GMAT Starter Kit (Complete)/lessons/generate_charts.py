"""
Generate educational charts for GMAT Data Insights Overview
This script creates all the images referenced in L4_DataInsightsOverview.md
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np
import os

# Create images directory if it doesn't exist
os.makedirs('images', exist_ok=True)

# Set style for all charts
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.size'] = 10
plt.rcParams['figure.dpi'] = 150

# Define pastel color palette
PASTEL_COLORS = {
    'red': '#FF9999',
    'blue': '#99CCFF',
    'green': '#99FF99',
    'orange': '#FFCC99',
    'purple': '#CC99FF',
    'pink': '#FF99CC',
    'yellow': '#FFFF99',
    'teal': '#99FFCC',
    'coral': '#FFB299',
    'lavender': '#E6E6FA',
    'mint': '#B2FFD6',
    'peach': '#FFDAB9',
    'sky': '#87CEEB',
    'salmon': '#FFA07A',
    'lime': '#B2FF66',
}

def save_figure(filename):
    """Save figure and close it"""
    plt.savefig(f'images/{filename}', bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close()
    print(f"Created: images/{filename}")


# =============================================================================
# 1. Network Diagram - Pen Pal Correspondence (qualchartB.png)
# =============================================================================
def create_network_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(8, 6))

    # Node positions (arranged in a circle-like pattern)
    positions = {
        'A': (0.2, 0.8),   # Alice
        'B': (0.8, 0.8),   # Ben
        'C': (0.5, 0.5),   # Cathy
        'D': (0.2, 0.2),   # Dave
        'E': (0.8, 0.2),   # Ellen
        'F': (0.5, 0.9),   # Frank
    }

    # Draw nodes
    node_radius = 0.06
    for name, (x, y) in positions.items():
        circle = Circle((x, y), node_radius, facecolor=PASTEL_COLORS['sky'], edgecolor='#4A4A4A', linewidth=2)
        ax.add_patch(circle)
        ax.text(x, y, name, ha='center', va='center', fontsize=14, fontweight='bold')

    # Define edges (from, to) - arrows showing who sent letters to whom
    # Based on description: Cathy received 3 letters, Frank received none
    edges = [
        ('A', 'C'),  # Alice -> Cathy
        ('B', 'C'),  # Ben -> Cathy
        ('D', 'C'),  # Dave -> Cathy
        ('A', 'B'),  # Alice -> Ben
        ('B', 'A'),  # Ben -> Alice (bidirectional)
        ('C', 'E'),  # Cathy -> Ellen
        ('E', 'D'),  # Ellen -> Dave
        ('D', 'A'),  # Dave -> Alice
    ]

    # Draw arrows
    for start, end in edges:
        x1, y1 = positions[start]
        x2, y2 = positions[end]

        # Calculate direction and offset for arrow
        dx = x2 - x1
        dy = y2 - y1
        dist = np.sqrt(dx**2 + dy**2)

        # Offset from node centers
        offset = node_radius * 1.2
        x1_adj = x1 + (dx/dist) * offset
        y1_adj = y1 + (dy/dist) * offset
        x2_adj = x2 - (dx/dist) * offset
        y2_adj = y2 - (dy/dist) * offset

        ax.annotate('', xy=(x2_adj, y2_adj), xytext=(x1_adj, y1_adj),
                   arrowprops=dict(arrowstyle='->', color='#5B5B5B', lw=1.5))

    # Add legend
    ax.text(0.5, 0.02, 'A=Alice, B=Ben, C=Cathy, D=Dave, E=Ellen, F=Frank\nArrows show direction of letters sent',
            ha='center', va='bottom', fontsize=9, style='italic')

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title('Network Diagram: Pen Pal Correspondence', fontsize=14, fontweight='bold', pad=10)

    save_figure('qualchartB.png')


# =============================================================================
# 2. Tree Diagram - Haruto's Family Tree (qualchartC.png)
# =============================================================================
def create_tree_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(10, 7))

    # Family tree structure
    positions = {
        'Haruto': (0.5, 0.9),
        'Honoka': (0.3, 0.65),
        'Akari': (0.7, 0.65),
        'Minato': (0.15, 0.4),
        'Himari': (0.35, 0.4),
        'Yuki': (0.6, 0.4),
        'Mei': (0.8, 0.4),
    }

    # Parent-child relationships
    edges = [
        ('Haruto', 'Honoka'),
        ('Haruto', 'Akari'),
        ('Honoka', 'Minato'),
        ('Honoka', 'Himari'),
        ('Akari', 'Yuki'),
        ('Akari', 'Mei'),
    ]

    # Draw edges FIRST (lines connecting parents to children) - so they're behind nodes
    for parent, child in edges:
        x1, y1 = positions[parent]
        x2, y2 = positions[child]
        ax.plot([x1, x2], [y1, y2], color='#5B5B5B', linewidth=2, zorder=1)

    # Draw nodes ON TOP of edges
    for name, (x, y) in positions.items():
        circle = Circle((x, y), 0.06, facecolor=PASTEL_COLORS['mint'], edgecolor='#4A4A4A', linewidth=2, zorder=2)
        ax.add_patch(circle)
        ax.text(x, y, name, ha='center', va='center', fontsize=9, fontweight='bold', zorder=3)

    # Add generation labels - adjusted positions to avoid overlap
    ax.text(0.02, 0.9, 'Generation 1', fontsize=9, style='italic', va='center')
    ax.text(0.02, 0.65, 'Generation 2', fontsize=9, style='italic', va='center')
    ax.text(0.02, 0.32, 'Generation 3', fontsize=9, style='italic', va='center')  # Moved down to avoid overlap

    ax.set_xlim(0, 1)
    ax.set_ylim(0.2, 1)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title("Tree Diagram: Haruto's Family Tree", fontsize=14, fontweight='bold', pad=10)

    save_figure('qualchartC.png')


# =============================================================================
# 3. Flowchart - Cereal Shopping Process (flowchart.png)
# =============================================================================
def create_flowchart():
    fig, ax = plt.subplots(1, 1, figsize=(8, 10))

    # Define node positions and types
    nodes = {
        'start': {'pos': (0.5, 0.95), 'type': 'terminal', 'text': 'Go to store'},
        'look': {'pos': (0.5, 0.78), 'type': 'process', 'text': 'Look for a\ncereal you like'},
        'found': {'pos': (0.5, 0.6), 'type': 'decision', 'text': 'Found\ncereal?'},
        'buy': {'pos': (0.2, 0.42), 'type': 'process', 'text': 'Buy the cereal'},
        'other': {'pos': (0.8, 0.42), 'type': 'decision', 'text': 'Other good\nchoices?'},
        'end': {'pos': (0.5, 0.15), 'type': 'terminal', 'text': 'Go home'},
    }

    # Draw nodes
    for node_id, node_info in nodes.items():
        x, y = node_info['pos']
        node_type = node_info['type']
        text = node_info['text']

        if node_type == 'terminal':
            # Oval shape
            ellipse = mpatches.Ellipse((x, y), 0.25, 0.08, facecolor=PASTEL_COLORS['coral'], edgecolor='#4A4A4A', linewidth=2)
            ax.add_patch(ellipse)
        elif node_type == 'process':
            # Rectangle
            rect = FancyBboxPatch((x-0.12, y-0.05), 0.24, 0.1, boxstyle="round,pad=0.01",
                                  facecolor=PASTEL_COLORS['yellow'], edgecolor='#4A4A4A', linewidth=2)
            ax.add_patch(rect)
        elif node_type == 'decision':
            # Diamond
            diamond = plt.Polygon([(x, y+0.07), (x+0.12, y), (x, y-0.07), (x-0.12, y)],
                                 facecolor=PASTEL_COLORS['sky'], edgecolor='#4A4A4A', linewidth=2)
            ax.add_patch(diamond)

        ax.text(x, y, text, ha='center', va='center', fontsize=8, fontweight='bold')

    # Draw arrows
    arrow_style = dict(arrowstyle='->', color='#4A4A4A', lw=1.5)

    # start -> look
    ax.annotate('', xy=(0.5, 0.83), xytext=(0.5, 0.91), arrowprops=arrow_style)

    # look -> found
    ax.annotate('', xy=(0.5, 0.67), xytext=(0.5, 0.73), arrowprops=arrow_style)

    # found -> buy (Yes)
    ax.annotate('', xy=(0.2, 0.47), xytext=(0.38, 0.6), arrowprops=arrow_style)
    ax.text(0.25, 0.55, 'Yes', fontsize=8, color='#2E7D32', fontweight='bold')

    # found -> other (No)
    ax.annotate('', xy=(0.68, 0.42), xytext=(0.62, 0.6), arrowprops=arrow_style)
    ax.text(0.68, 0.55, 'No', fontsize=8, color='#C62828', fontweight='bold')

    # buy -> end
    ax.annotate('', xy=(0.35, 0.15), xytext=(0.2, 0.37), arrowprops=arrow_style)

    # other -> end (No)
    ax.annotate('', xy=(0.65, 0.15), xytext=(0.8, 0.35), arrowprops=arrow_style)
    ax.text(0.85, 0.28, 'No', fontsize=8, color='#C62828', fontweight='bold')

    # other -> look (Yes) - loop back
    ax.annotate('', xy=(0.62, 0.78), xytext=(0.92, 0.45),
               arrowprops=dict(arrowstyle='->', color='#4A4A4A', lw=1.5,
                              connectionstyle='arc3,rad=0.3'))
    ax.text(0.92, 0.62, 'Yes', fontsize=8, color='#2E7D32', fontweight='bold')

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title('Flowchart: Cereal Shopping Process', fontsize=14, fontweight='bold', pad=10)

    save_figure('flowchart.png')


# =============================================================================
# 4. Dual-axis Line Chart - Temperature and Precipitation (avg_temp_city_x.png)
# =============================================================================
def create_temp_precip_chart():
    fig, ax1 = plt.subplots(figsize=(8, 5))

    months = ['January', 'April', 'July', 'October']
    temperatures = [5, 14, 25, 12]  # Celsius
    precipitation = [4, 8, 12, 6]   # cm

    # Temperature line (left axis)
    color1 = PASTEL_COLORS['coral']
    ax1.set_xlabel('Month', fontsize=11)
    ax1.set_ylabel('Temperature (°C)', color='#C62828', fontsize=11)
    line1 = ax1.plot(months, temperatures, color=color1, marker='o', linewidth=2.5, markersize=8, label='Temperature', zorder=3)
    ax1.tick_params(axis='y', labelcolor='#C62828')
    ax1.set_ylim(0, 30)

    # Precipitation line (right axis)
    ax2 = ax1.twinx()
    color2 = PASTEL_COLORS['blue']
    ax2.set_ylabel('Precipitation (cm)', color='#1565C0', fontsize=11)
    line2 = ax2.plot(months, precipitation, color=color2, marker='s', linewidth=2.5, markersize=8, label='Precipitation', zorder=3)
    ax2.tick_params(axis='y', labelcolor='#1565C0')
    ax2.set_ylim(0, 15)

    # Ensure grid is in background
    ax1.set_axisbelow(True)
    ax1.grid(True, alpha=0.3, zorder=0)

    # Add legend with background - need higher zorder to be above grid
    lines = line1 + line2
    labels = [l.get_label() for l in lines]
    legend = ax1.legend(lines, labels, loc='upper left', fontsize=11, frameon=True,
                        facecolor='white', edgecolor='#CCCCCC', framealpha=1)
    legend.get_frame().set_linewidth(1.5)
    legend.set_zorder(10)  # Ensure legend is above everything including grid

    plt.title('Average Monthly Temperature and Precipitation in City X', fontsize=12, fontweight='bold')
    plt.tight_layout()

    save_figure('avg_temp_city_x.png')


# =============================================================================
# 5. Pie Chart - Al's Salary Distribution (net_salary_pie_chart.png)
# =============================================================================
def create_pie_chart():
    fig, ax = plt.subplots(figsize=(8, 6))

    categories = ['Rent and\nUtilities', 'Savings', 'Food', 'Transportation', 'Entertainment']
    percentages = [30, 25, 20, 15, 10]
    colors = [PASTEL_COLORS['red'], PASTEL_COLORS['blue'], PASTEL_COLORS['green'],
              PASTEL_COLORS['orange'], PASTEL_COLORS['pink']]
    explode = (0.05, 0.05, 0, 0, 0)  # Emphasize top two categories

    wedges, texts, autotexts = ax.pie(percentages, labels=categories, autopct='%1.0f%%',
                                       colors=colors, explode=explode, startangle=90,
                                       pctdistance=0.75, wedgeprops={'edgecolor': '#4A4A4A', 'linewidth': 1})

    # Style the percentage text
    for autotext in autotexts:
        autotext.set_fontsize(10)
        autotext.set_fontweight('bold')

    ax.set_title("Distribution of Al's Weekly Net Salary", fontsize=14, fontweight='bold', pad=20)

    save_figure('net_salary_pie_chart.png')


# =============================================================================
# 6. Grouped & Stacked Bar Chart - Town Populations (bar_chart_example.png)
# =============================================================================
def create_bar_chart():
    fig, ax = plt.subplots(figsize=(10, 6))

    towns = ['Aville', 'Btown', 'Ceburg']
    x = np.arange(len(towns))
    width = 0.35

    # Population data (in thousands)
    under30_2010 = [0.8, 1.5, 1.1]
    over30_2010 = [0.6, 1.0, 0.9]
    under30_2020 = [1.0, 1.8, 1.2]
    over30_2020 = [0.8, 1.4, 1.2]

    # 2010 bars
    bars1_bottom = ax.bar(x - width/2, under30_2010, width, label='Under 30 (2010)',
                          color=PASTEL_COLORS['sky'], edgecolor='#4A4A4A')
    bars1_top = ax.bar(x - width/2, over30_2010, width, bottom=under30_2010,
                       label='30 or older (2010)', color=PASTEL_COLORS['blue'], edgecolor='#4A4A4A')

    # 2020 bars
    bars2_bottom = ax.bar(x + width/2, under30_2020, width, label='Under 30 (2020)',
                          color=PASTEL_COLORS['mint'], edgecolor='#4A4A4A')
    bars2_top = ax.bar(x + width/2, over30_2020, width, bottom=under30_2020,
                       label='30 or older (2020)', color=PASTEL_COLORS['green'], edgecolor='#4A4A4A')

    ax.set_xlabel('Town', fontsize=11)
    ax.set_ylabel('Population (thousands)', fontsize=11)
    ax.set_title('Town Populations by Age Group (2010 vs 2020)', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(towns)

    # Legend with background
    legend = ax.legend(loc='upper left', fontsize=10, frameon=True,
                       facecolor='white', edgecolor='#CCCCCC', framealpha=1)
    legend.get_frame().set_linewidth(1.5)

    ax.set_ylim(0, 3.5)

    # Add year labels below bars
    for i, town in enumerate(towns):
        ax.text(i - width/2, -0.15, '2010', ha='center', fontsize=8)
        ax.text(i + width/2, -0.15, '2020', ha='center', fontsize=8)

    plt.tight_layout()
    save_figure('bar_chart_example.png')


# =============================================================================
# 7. Histogram - Gerbil Weights (gerbil_histogram.png)
# =============================================================================
def create_histogram():
    fig, ax = plt.subplots(figsize=(8, 5))

    # Weight ranges and counts (31 gerbils total)
    weight_ranges = ['60-65', '65-70', '70-75', '75-80', '80-85', '85-90']
    counts = [3, 5, 7, 8, 5, 3]  # Total = 31

    x = np.arange(len(weight_ranges))
    bars = ax.bar(x, counts, color=PASTEL_COLORS['sky'], edgecolor='#4A4A4A', linewidth=1.5)

    # Highlight the median range
    bars[3].set_color(PASTEL_COLORS['coral'])

    ax.set_xlabel('Weight Range (grams)', fontsize=11)
    ax.set_ylabel('Number of Gerbils', fontsize=11)
    ax.set_title('Histogram: Weights of 31 Gerbils', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(weight_ranges)

    # Add count labels on bars
    for i, (bar, count) in enumerate(zip(bars, counts)):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.2,
               str(count), ha='center', va='bottom', fontsize=10, fontweight='bold')

    # Add annotation for median
    ax.annotate('Median range', xy=(3, 8), xytext=(4.5, 9),
               arrowprops=dict(arrowstyle='->', color='#4A4A4A'),
               fontsize=9, style='italic')

    ax.set_ylim(0, 11)
    plt.tight_layout()
    save_figure('gerbil_histogram.png')


# =============================================================================
# 8. Line Chart - Toaster Sales (linechartexample.png)
# =============================================================================
def create_line_chart():
    fig, ax = plt.subplots(figsize=(10, 6))

    years = [2017, 2018, 2019, 2020, 2021, 2022]

    # Sales data (thousands)
    crispo = [10, 40, 80, 120, 160, 185]      # Increasing dramatically
    brownita = [120, 90, 60, 30, 10, 5]       # Declining
    toastador = [50, 70, 45, 80, 55, 65]      # Fluctuating

    ax.plot(years, crispo, color=PASTEL_COLORS['green'], marker='o', linewidth=2.5, markersize=8, label='Crispo')
    ax.plot(years, brownita, color=PASTEL_COLORS['coral'], marker='s', linewidth=2.5, markersize=8, label='Brownita')
    ax.plot(years, toastador, color=PASTEL_COLORS['blue'], marker='^', linewidth=2.5, markersize=8, label='Toastador')

    ax.set_xlabel('Year', fontsize=11)
    ax.set_ylabel('Sales (thousands of units)', fontsize=11)
    ax.set_title('Annual Toaster Sales by Brand (2017-2022)', fontsize=14, fontweight='bold')

    # Legend with background
    legend = ax.legend(loc='center right', fontsize=11, frameon=True,
                       facecolor='white', edgecolor='#CCCCCC', framealpha=1)
    legend.get_frame().set_linewidth(1.5)

    ax.set_xticks(years)
    ax.set_ylim(0, 200)
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    save_figure('linechartexample.png')


# =============================================================================
# 9. Distribution Comparison - Beetle Lengths (distributioncomparison.png)
# =============================================================================
def create_distribution_comparison():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    x = np.linspace(0, 10, 1000)

    # Species A - Normal distribution centered at 5mm
    mean_a = 5
    std_a = 1
    y_a = (1/(std_a * np.sqrt(2*np.pi))) * np.exp(-0.5*((x-mean_a)/std_a)**2)

    ax1.plot(x, y_a, color=PASTEL_COLORS['blue'], linewidth=2.5)
    ax1.fill_between(x, y_a, alpha=0.4, color=PASTEL_COLORS['blue'])
    ax1.axvline(x=5, color=PASTEL_COLORS['coral'], linestyle='--', linewidth=2, label='Mean = Median = Mode')
    ax1.set_xlabel('Length (mm)', fontsize=11)
    ax1.set_ylabel('Frequency', fontsize=11)
    ax1.set_title('Species A: Normal Distribution', fontsize=12, fontweight='bold')

    # Legend with background
    legend1 = ax1.legend(fontsize=10, frameon=True, facecolor='white',
                         edgecolor='#CCCCCC', framealpha=1)
    legend1.get_frame().set_linewidth(1.5)

    ax1.set_xlim(0, 10)
    ax1.set_ylim(0, 0.45)  # Adjusted to fit the curve

    # Species B - Right-skewed distribution with lower peak
    try:
        from scipy import stats
        a = 3  # Reduced skewness parameter for lower peak
        y_b = stats.skewnorm.pdf(x, a, loc=4.2, scale=1.5)  # Wider spread, lower peak
    except ImportError:
        # Fallback approximation if scipy not available
        y_b = (1/(1.5 * np.sqrt(2*np.pi))) * np.exp(-0.5*((x-4.5)/1.5)**2)
        y_b = y_b * (1 + 0.2 * (x - 4.5))  # Simple skew approximation
        y_b = np.maximum(y_b, 0)

    ax2.plot(x, y_b, color=PASTEL_COLORS['green'], linewidth=2.5)
    ax2.fill_between(x, y_b, alpha=0.4, color=PASTEL_COLORS['green'])

    # Calculate mode, median, mean for skewed distribution
    mode_b = 4.0
    median_b = 4.8
    mean_b = 5.5

    ax2.axvline(x=mode_b, color=PASTEL_COLORS['blue'], linestyle=':', linewidth=2, label=f'Mode ≈ {mode_b}')
    ax2.axvline(x=median_b, color=PASTEL_COLORS['orange'], linestyle='--', linewidth=2, label=f'Median ≈ {median_b}')
    ax2.axvline(x=mean_b, color=PASTEL_COLORS['coral'], linestyle='-', linewidth=2, label=f'Mean ≈ {mean_b}')

    ax2.set_xlabel('Length (mm)', fontsize=11)
    ax2.set_ylabel('Frequency', fontsize=11)
    ax2.set_title('Species B: Right-Skewed Distribution', fontsize=12, fontweight='bold')

    # Legend with background
    legend2 = ax2.legend(fontsize=10, loc='upper right', frameon=True,
                         facecolor='white', edgecolor='#CCCCCC', framealpha=1)
    legend2.get_frame().set_linewidth(1.5)

    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 0.45)  # Same scale as Species A

    plt.tight_layout()
    save_figure('distributioncomparison.png')


# =============================================================================
# 10. Task Completion Time Distributions (distributionexample.png)
# =============================================================================
def create_task_distributions():
    fig, ax = plt.subplots(figsize=(10, 6))

    x = np.linspace(0, 6, 1000)
    mean = 3

    # Three tasks with different standard deviations
    std_a = 0.4  # Task A - tightly clustered
    std_b = 0.8  # Task B - moderate
    std_c = 1.2  # Task C - widely spread

    y_a = (1/(std_a * np.sqrt(2*np.pi))) * np.exp(-0.5*((x-mean)/std_a)**2)
    y_b = (1/(std_b * np.sqrt(2*np.pi))) * np.exp(-0.5*((x-mean)/std_b)**2)
    y_c = (1/(std_c * np.sqrt(2*np.pi))) * np.exp(-0.5*((x-mean)/std_c)**2)

    ax.plot(x, y_a, color=PASTEL_COLORS['blue'], linewidth=2.5, label=f'Task A (σ = {std_a})')
    ax.plot(x, y_b, color=PASTEL_COLORS['green'], linewidth=2.5, label=f'Task B (σ = {std_b})')
    ax.plot(x, y_c, color=PASTEL_COLORS['coral'], linewidth=2.5, label=f'Task C (σ = {std_c})')

    ax.fill_between(x, y_a, alpha=0.25, color=PASTEL_COLORS['blue'])
    ax.fill_between(x, y_b, alpha=0.2, color=PASTEL_COLORS['green'])
    ax.fill_between(x, y_c, alpha=0.15, color=PASTEL_COLORS['coral'])

    ax.axvline(x=3, color='#5B5B5B', linestyle='--', alpha=0.7, linewidth=1.5, label='Mean = 3 min')

    ax.set_xlabel('Completion Time (minutes)', fontsize=11)
    ax.set_ylabel('Frequency', fontsize=11)
    ax.set_title('Task Completion Time Distributions', fontsize=14, fontweight='bold')

    # Legend with background
    legend = ax.legend(loc='upper right', fontsize=11, frameon=True,
                       facecolor='white', edgecolor='#CCCCCC', framealpha=1)
    legend.get_frame().set_linewidth(1.5)

    ax.set_xlim(0, 6)
    ax.set_ylim(0, 1.1)

    # Add annotation
    ax.annotate('Task A: Most predictable\n(lowest std. deviation)',
               xy=(3, 0.95), xytext=(4.5, 0.8),
               arrowprops=dict(arrowstyle='->', color=PASTEL_COLORS['blue']),
               fontsize=9, color='#1565C0')

    plt.tight_layout()
    save_figure('distributionexample.png')


# =============================================================================
# 11. Scatterplot - Leaf Measurements (scatterplotexample.png)
# =============================================================================
def create_scatterplot():
    fig, ax = plt.subplots(figsize=(9, 6))

    # Generate sample data for two plants
    np.random.seed(42)

    # Plant 1 - smaller leaves
    n1 = 20
    length1 = np.random.uniform(2, 5, n1)
    width1 = 0.4 * length1 + np.random.normal(0, 0.2, n1)

    # Plant 2 - larger leaves
    n2 = 20
    length2 = np.random.uniform(4, 7, n2)
    width2 = 0.45 * length2 + np.random.normal(0, 0.25, n2)

    ax.scatter(length1, width1, c=PASTEL_COLORS['blue'], marker='o', s=70,
               label='Plant 1', alpha=0.8, edgecolors='#4A4A4A', linewidth=1)
    ax.scatter(length2, width2, c=PASTEL_COLORS['green'], marker='s', s=70,
               label='Plant 2', alpha=0.8, edgecolors='#4A4A4A', linewidth=1)

    # Add trend line
    all_length = np.concatenate([length1, length2])
    all_width = np.concatenate([width1, width2])
    z = np.polyfit(all_length, all_width, 1)
    p = np.poly1d(z)
    x_trend = np.linspace(2, 7, 100)
    ax.plot(x_trend, p(x_trend), color=PASTEL_COLORS['coral'], linestyle='--',
            alpha=0.7, linewidth=2, label='Trend line')

    ax.set_xlabel('Leaf Length (cm)', fontsize=11)
    ax.set_ylabel('Leaf Width (cm)', fontsize=11)
    ax.set_title('Scatterplot: Leaf Width vs Length for Two Plants', fontsize=14, fontweight='bold')

    # Legend with background
    legend = ax.legend(loc='upper left', fontsize=11, frameon=True,
                       facecolor='white', edgecolor='#CCCCCC', framealpha=1)
    legend.get_frame().set_linewidth(1.5)

    ax.set_xlim(1, 8)
    ax.set_ylim(0, 4)
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    save_figure('scatterplotexample.png')


# =============================================================================
# Main execution
# =============================================================================
if __name__ == '__main__':
    print("Generating GMAT Data Insights charts...")
    print("=" * 50)

    # Check for scipy (needed for skewed distribution)
    try:
        from scipy import stats
        has_scipy = True
    except ImportError:
        has_scipy = False
        print("Warning: scipy not found. Skewed distribution will use approximation.")

    # Generate all charts
    create_network_diagram()
    create_tree_diagram()
    create_flowchart()
    create_temp_precip_chart()
    create_pie_chart()
    create_bar_chart()
    create_histogram()
    create_line_chart()
    create_distribution_comparison()
    create_task_distributions()
    create_scatterplot()

    print("=" * 50)
    print("All charts generated successfully!")
    print(f"Images saved in: {os.path.abspath('images')}")
