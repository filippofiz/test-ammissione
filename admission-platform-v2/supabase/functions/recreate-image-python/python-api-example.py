"""
Python Image Recreation API
Professional image recreation service for PDF-extracted images

Deploy this as a separate service (Flask, FastAPI, or AWS Lambda)
and set the PYTHON_IMAGE_RECREATION_URL environment variable to its URL.

Example deployment options:
1. Flask on a server
2. FastAPI with Uvicorn
3. AWS Lambda with API Gateway
4. Google Cloud Functions
5. Azure Functions

Requirements:
- pip install flask pillow opencv-python numpy matplotlib cairosvg
"""

from flask import Flask, request, jsonify
from PIL import Image, ImageEnhance, ImageFilter
import base64
import io
import numpy as np
import cv2

app = Flask(__name__)

def recreate_image_professionally(image_base64: str, width: int, height: int) -> dict:
    """
    Professionally recreate an image using Python image processing libraries.

    This function:
    1. Decodes the base64 image
    2. Enhances quality (sharpness, contrast, brightness)
    3. Removes noise
    4. Optionally upscales
    5. Returns the enhanced image as base64
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))

        print(f"📥 Received image: {image.size}, mode: {image.mode}")

        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # 1. Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.5)  # Increase sharpness by 50%

        # 2. Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)  # Increase contrast by 20%

        # 3. Convert to numpy array for OpenCV processing
        img_array = np.array(image)

        # 4. Denoise using OpenCV
        img_array = cv2.fastNlMeansDenoisingColored(img_array, None, 10, 10, 7, 21)

        # 5. Sharpen using kernel
        kernel = np.array([[-1,-1,-1],
                          [-1, 9,-1],
                          [-1,-1,-1]])
        img_array = cv2.filter2D(img_array, -1, kernel)

        # 6. Convert back to PIL Image
        image = Image.fromarray(img_array)

        # 7. Optional: Upscale if image is too small
        min_dimension = 800
        if image.width < min_dimension or image.height < min_dimension:
            scale_factor = min_dimension / min(image.width, image.height)
            new_width = int(image.width * scale_factor)
            new_height = int(image.height * scale_factor)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"📐 Upscaled from {width}x{height} to {new_width}x{new_height}")

        # 8. Save to buffer and encode as base64
        buffer = io.BytesIO()
        image.save(buffer, format='PNG', quality=95, optimize=True)
        recreated_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        print(f"✅ Recreation complete: {image.size}")

        return {
            'recreated_image_base64': recreated_base64,
            'width': image.width,
            'height': image.height,
            'format': 'png',
            'quality': 'high',
            'enhancements_applied': [
                'sharpness_enhancement',
                'contrast_enhancement',
                'noise_reduction',
                'kernel_sharpening',
                'optional_upscaling'
            ]
        }

    except Exception as e:
        print(f"❌ Error recreating image: {str(e)}")
        raise

@app.route('/recreate-image', methods=['POST'])
def recreate_image():
    """
    API endpoint for image recreation.

    Expected JSON body:
    {
        "image_base64": "base64_encoded_image_data",
        "width": 800,
        "height": 600,
        "enhance": true,
        "vectorize": false
    }
    """
    try:
        data = request.get_json()

        image_base64 = data.get('image_base64')
        width = data.get('width', 0)
        height = data.get('height', 0)
        enhance = data.get('enhance', True)

        if not image_base64:
            return jsonify({'error': 'Missing image_base64'}), 400

        if not enhance:
            # Return original image if enhancement not requested
            return jsonify({
                'recreated_image_base64': image_base64,
                'width': width,
                'height': height,
                'format': 'png',
                'quality': 'original'
            })

        result = recreate_image_professionally(image_base64, width, height)
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'image-recreation-api'})

if __name__ == '__main__':
    print("🐍 Starting Python Image Recreation API...")
    print("📍 Endpoint: http://localhost:5000/recreate-image")
    print("🔍 Health check: http://localhost:5000/health")
    app.run(host='0.0.0.0', port=5000, debug=True)
