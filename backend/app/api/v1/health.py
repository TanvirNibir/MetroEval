"""Health check endpoint for monitoring"""
from flask import jsonify
from . import api_v1

@api_v1.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring and load balancers"""
    try:
        # Basic health check - app is running
        return jsonify({
            'status': 'healthy',
            'service': 'MetroEval API',
            'version': '1.0.0'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

