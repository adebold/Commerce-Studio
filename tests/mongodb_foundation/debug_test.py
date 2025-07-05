import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
import asyncio
from unittest.mock import AsyncMock, MagicMock
from mongodb_foundation.managers import ProductCollectionManager
from mongodb_foundation.types import ServiceError, ErrorType
from mongodb_foundation.security import validate_input, SecurityViolation

async def test():
    print('Creating manager with mocked database...')
    
    # Create mock database and collection
    mock_db = MagicMock()
    mock_collection = AsyncMock()
    mock_db.products = mock_collection
    mock_collection.find_one.return_value = None
    
    # Create manager
    manager = ProductCollectionManager(mock_db)
    
    print('Manually testing the exact code path in findBySku...')
    
    sku = 'sku with spaces'
    
    print(f'Now testing the full findBySku method with sku="{sku}"')
    
    # First, test validate_input directly again within the same context
    print("Testing validate_input directly within same context...")
    try:
        validated = validate_input(sku, "sku")
        print(f"PROBLEM: validate_input returned: {validated}")
    except SecurityViolation as e:
        print(f"validate_input correctly raised SecurityViolation: {e}")
    except Exception as e:
        print(f"validate_input raised unexpected exception: {type(e).__name__}: {e}")
    
    # Now test the full method - but let's manually trace through it
    print("Manually stepping through findBySku...")
    try:
        print("Step 1: About to call validate_input inside try block")
        validated_sku = validate_input(sku, "sku")
        print(f"Step 2: validate_input returned (this should not happen): {validated_sku}")
        
        print("Step 3: About to call find_one")
        product = await manager.collection.find_one({"sku": validated_sku})
        print(f"Step 4: find_one returned: {product}")
        
        # Convert ObjectId to string if product found
        if product and '_id' in product:
            product['_id'] = str(product['_id'])
        
        print(f"Step 5: Final result: {product}")
        
    except SecurityViolation as e:
        print(f'SecurityViolation caught in manual trace: {e}')
    except Exception as e:
        print(f'Other exception in manual trace: {type(e).__name__}: {e}')
    
    # Now test the actual method
    try:
        result = await manager.findBySku(sku)
        print(f'UNEXPECTED: findBySku returned: {result}')
    except ServiceError as e:
        print(f'ServiceError caught correctly: {e}')
        print(f'  Error type: {e.type}')
        print(f'  Expected: {ErrorType.SECURITY_VIOLATION}')
        print(f'  Match: {e.type == ErrorType.SECURITY_VIOLATION}')
    except SecurityViolation as e:
        print(f'SecurityViolation caught (should be converted to ServiceError): {e}')
    except Exception as e:
        print(f'Other exception caught: {type(e).__name__}: {e}')

if __name__ == "__main__":
    asyncio.run(test())