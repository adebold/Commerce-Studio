import numpy as np
import scipy
from scipy import stats
from scipy import optimize
from scipy import interpolate

def test_scipy_stats():
    """Test scipy.stats functionality"""
    # Generate some random data
    data = np.random.normal(0, 1, 1000)
    
    # Calculate mean and standard deviation
    mean = np.mean(data)
    std = np.std(data)
    
    # Calculate t-test
    t_stat, p_value = stats.ttest_1samp(data, 0)
    
    print(f"Stats test: mean={mean:.4f}, std={std:.4f}, t-stat={t_stat:.4f}, p-value={p_value:.4f}")
    return True

def test_scipy_optimize():
    """Test scipy.optimize functionality"""
    # Define a function to minimize
    def f(x):
        return x**2 + 10*np.sin(x)
    
    # Find the minimum
    result = optimize.minimize(f, x0=0)
    
    print(f"Optimize test: minimum at x={result.x[0]:.4f}, f(x)={result.fun:.4f}")
    return True

def test_scipy_interpolate():
    """Test scipy.interpolate functionality"""
    # Create some data points
    x = np.linspace(0, 10, 10)
    y = np.sin(x)
    
    # Create an interpolation function
    f = interpolate.interp1d(x, y)
    
    # Interpolate at a new point
    x_new = 5.5
    y_new = f(x_new)
    
    print(f"Interpolate test: f({x_new}) = {y_new:.4f}")
    return True

if __name__ == "__main__":
    print(f"Testing scipy version {scipy.__version__}")
    
    # Run tests
    stats_ok = test_scipy_stats()
    optimize_ok = test_scipy_optimize()
    interpolate_ok = test_scipy_interpolate()
    
    # Print summary
    if stats_ok and optimize_ok and interpolate_ok:
        print("\nAll scipy functionality tests passed!")
    else:
        print("\nSome tests failed!")