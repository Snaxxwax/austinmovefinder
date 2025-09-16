#!/bin/bash

# Austin Move Finder Backend Test Script

echo "🧪 Testing Austin Move Finder Backend..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/health

echo -e "\n\n2. Testing API documentation..."
curl -s http://localhost:5000/api | jq '.' 2>/dev/null || curl -s http://localhost:5000/api

echo -e "\n\n3. Testing quote creation..."
curl -X POST http://localhost:5000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@austinmovefinder.com",
    "phone": "(512) 555-TEST",
    "move_type": "local",
    "move_date": "2024-03-15",
    "from_address": "123 Congress Ave, Austin, TX",
    "to_address": "456 South Lamar, Austin, TX",
    "estimated_size": "2br",
    "special_items": "Piano",
    "notes": "Third floor apartment"
  }' | jq '.' 2>/dev/null || echo "Quote creation test sent"

echo -e "\n\n✅ Backend testing complete!"