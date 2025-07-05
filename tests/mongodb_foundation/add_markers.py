#!/usr/bin/env python3
"""Script to add @pytest.mark.red_phase markers to all test methods"""

import re

def add_red_phase_markers():
    with open('test_tdd_framework_specification.py', 'r') as f:
        content = f.read()
    
    # Pattern to find @pytest.mark.asyncio followed by async def test_
    pattern = r'(\s+)@pytest\.mark\.asyncio(\s+async def test_.*_red_phase\(self\):)'
    
    # Replacement to add the red_phase marker
    replacement = r'\1@pytest.mark.asyncio\n\1@pytest.mark.red_phase\2'
    
    # Apply the replacement
    new_content = re.sub(pattern, replacement, content)
    
    # Count how many replacements were made
    count = len(re.findall(pattern, content))
    print(f"Added @pytest.mark.red_phase to {count} test methods")
    
    # Write back to file
    with open('test_tdd_framework_specification.py', 'w') as f:
        f.write(new_content)

if __name__ == '__main__':
    add_red_phase_markers()