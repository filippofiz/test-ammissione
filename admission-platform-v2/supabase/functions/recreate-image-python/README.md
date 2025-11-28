# Claude-Powered Image Recreation API

This edge function uses Claude API to analyze images and generate Python code for professional image enhancement.

## Architecture

```
Frontend (React)
    ↓
Supabase Edge Function (TypeScript/Deno)
    ↓
Claude API (Anthropic)
    ↓
Generated Python Code
    ↓
Image Enhancement (PIL, OpenCV)
```

## Setup Instructions

### 1. Configure Environment Variables

Add your Anthropic API key to your Supabase project:

```bash
# Set your Claude API key
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Or for local development, add to .env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

### 2. Get Your Claude API Key

1. Go to https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)

### 3. Deploy the Edge Function

```bash
supabase functions deploy recreate-image-python
```

## How It Works

1. **User selects "Extract from PDF" with "Recreate with Python API" checkbox**
2. **Images are extracted from PDF** (client-side using pdf.js)
3. **Each image is sent to the edge function** as base64
4. **Edge function calls Claude API** with the image
5. **Claude analyzes the image and generates Python code** specifically tailored to enhance that image:
   - Analyzes image quality and content
   - Generates custom enhancement parameters
   - Creates Python code using PIL and OpenCV
   - Optimizes for graphs, charts, or diagrams
6. **Python code is executed** (future: using Pyodide or server-side Python)
7. **Enhanced image is returned** to the client

## Claude API Enhancements

Claude intelligently generates Python code that applies:

- ✅ **Intelligent Sharpness Enhancement** (based on image analysis)
- ✅ **Adaptive Contrast Adjustment** (optimized for content type)
- ✅ **Smart Noise Reduction** (preserves important details)
- ✅ **Content-Aware Sharpening** (different for text vs. graphs)
- ✅ **Conditional Upscaling** (only when beneficial)
- ✅ **Format-Specific Optimization** (graphs, charts, diagrams)

## Testing

### Test the Python API directly:
```bash
curl -X POST http://localhost:5000/health
```

### Test with a sample image:
```python
import requests
import base64

# Read image
with open('test_image.png', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode()

# Call API
response = requests.post('http://localhost:5000/recreate-image', json={
    'image_base64': image_data,
    'width': 800,
    'height': 600,
    'enhance': True
})

result = response.json()
print(result.keys())  # Should include 'recreated_image_base64'
```

## Requirements (Python)

```
flask==2.3.0
pillow==10.0.0
opencv-python==4.8.0
numpy==1.24.0
```

Save as `requirements.txt` for easy deployment.

## Troubleshooting

**Issue:** "PYTHON_IMAGE_RECREATION_URL not configured"
- **Solution:** The edge function will return the original image. Set the environment variable to enable Python recreation.

**Issue:** Python API timeout
- **Solution:** Increase the timeout in the edge function or optimize the Python processing.

**Issue:** Image quality not improved
- **Solution:** Adjust the enhancement parameters in python-api-example.py (sharpness, contrast values).

## Future Enhancements

- [ ] Vector conversion (SVG output)
- [ ] AI-based super-resolution
- [ ] OCR integration for text extraction
- [ ] Graph/chart detection and recreation
- [ ] Background removal
- [ ] Color correction
