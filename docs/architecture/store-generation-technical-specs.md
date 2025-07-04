# Store Generation Service - Technical Specifications

## Component Implementation Details

### 1. Store Generation Controller

**File**: `src/store_generation/controller.py`

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

from .templates.engine import TemplateEngine
from .assets.optimizer import AssetOptimizationPipeline
from .seo.engine import SEOOptimizationEngine
from .deployment.gateway import MultiChannelDeploymentGateway
from .data.mongodb_service import ProductDataService
from .cache.redis_service import StoreGenerationCache
from .models.config import StoreGenerationConfig
from .models.results import StoreGenerationResult

@dataclass
class GenerationMetrics:
    """Metrics for store generation performance"""
    total_products: int
    generation_time: float
    cache_hits: int
    cache_misses: int
    optimization_time: float
    deployment_time: float
    lighthouse_score: Optional[float] = None

class StoreGenerationController:
    """
    Main orchestrator for the store generation workflow.
    
    Responsibilities:
    - Coordinate all generation phases
    - Manage parallel processing
    - Handle caching and optimization
    - Track performance metrics
    - Provide real-time progress updates
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.logger = logging.getLogger(__name__)
        
        # Initialize core components
        self.template_engine = TemplateEngine()
        self.asset_optimizer = AssetOptimizationPipeline()
        self.seo_engine = SEOOptimizationEngine()
        self.deployment_gateway = MultiChannelDeploymentGateway()
        
        # Initialize data services
        self.product_service = ProductDataService()
        self.cache_service = StoreGenerationCache()
        
        # Performance tracking
        self.metrics = GenerationMetrics(
            total_products=0,
            generation_time=0.0,
            cache_hits=0,
            cache_misses=0,
            optimization_time=0.0,
            deployment_time=0.0
        )
        
        # Thread pool for CPU-intensive tasks
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def generate_store(self, config: StoreGenerationConfig) -> StoreGenerationResult:
        """
        Generate complete store from configuration.
        
        Performance target: <30 seconds for 1000+ products
        """
        start_time = datetime.utcnow()
        self.logger.info(f"Starting store generation with config: {config.store_id}")
        
        try:
            # Phase 1: Check cache
            cached_result = await self._check_cache(config)
            if cached_result:
                self.metrics.cache_hits += 1
                return cached_result
            
            self.metrics.cache_misses += 1
            
            # Phase 2: Fetch and validate product data
            products = await self._fetch_product_data(config)
            self.metrics.total_products = len(products)
            
            # Phase 3: Generate store structure (parallel processing)
            store_structure = await self._generate_store_structure(products, config)
            
            # Phase 4: Optimize assets (parallel processing)
            asset_start = datetime.utcnow()
            optimized_assets = await self._optimize_assets(store_structure, config)
            self.metrics.optimization_time = (datetime.utcnow() - asset_start).total_seconds()
            
            # Phase 5: Apply SEO optimizations
            seo_optimized_store = await self._apply_seo_optimizations(
                store_structure, config
            )
            
            # Phase 6: Deploy to channels (parallel deployment)
            deployment_start = datetime.utcnow()
            deployment_results = await self._deploy_multi_channel(
                seo_optimized_store, optimized_assets, config
            )
            self.metrics.deployment_time = (datetime.utcnow() - deployment_start).total_seconds()
            
            # Phase 7: Calculate performance metrics
            performance_metrics = await self._calculate_performance_metrics(
                seo_optimized_store
            )
            
            # Create final result
            result = StoreGenerationResult(
                store_id=config.store_id,
                store_structure=seo_optimized_store,
                assets=optimized_assets,
                deployments=deployment_results,
                performance_metrics=performance_metrics,
                generation_metrics=self.metrics
            )
            
            # Cache result for future use
            await self._cache_result(config, result)
            
            self.metrics.generation_time = (datetime.utcnow() - start_time).total_seconds()
            self.logger.info(
                f"Store generation completed in {self.metrics.generation_time:.2f}s "
                f"for {self.metrics.total_products} products"
            )
            
            return result
            
        except Exception as e:
            self.logger.error(f"Store generation failed: {str(e)}")
            raise StoreGenerationError(f"Generation failed: {str(e)}") from e
    
    async def _fetch_product_data(self, config: StoreGenerationConfig) -> List[EnhancedProduct]:
        """Fetch and validate product data from MongoDB"""
        try:
            # Fetch products with all related data
            products = await self.product_service.fetch_products_for_store(config)
            
            # Validate data quality
            validation_report = await self.product_service.validate_product_data(products)
            
            if validation_report.has_critical_issues():
                raise DataQualityError(
                    f"Critical data quality issues found: {validation_report.summary}"
                )
            
            # Apply filters and sorting
            filtered_products = await self._apply_product_filters(products, config)
            
            self.logger.info(f"Fetched {len(filtered_products)} products for store generation")
            return filtered_products
            
        except Exception as e:
            self.logger.error(f"Failed to fetch product data: {str(e)}")
            raise
    
    async def _generate_store_structure(self, products: List[EnhancedProduct], 
                                      config: StoreGenerationConfig) -> StoreStructure:
        """Generate store structure using template engine"""
        
        # Split products into chunks for parallel processing
        chunk_size = min(100, max(10, len(products) // 4))
        product_chunks = [
            products[i:i + chunk_size] 
            for i in range(0, len(products), chunk_size)
        ]
        
        # Process chunks in parallel
        chunk_tasks = [
            self.template_engine.process_product_chunk(chunk, config.template_config)
            for chunk in product_chunks
        ]
        
        chunk_results = await asyncio.gather(*chunk_tasks)
        
        # Combine chunk results
        combined_structure = await self.template_engine.combine_chunk_results(
            chunk_results, config.template_config
        )
        
        return combined_structure
    
    async def _optimize_assets(self, store_structure: StoreStructure, 
                             config: StoreGenerationConfig) -> OptimizedAssets:
        """Optimize all store assets for performance"""
        
        # Extract all assets from store structure
        all_assets = store_structure.extract_assets()
        
        # Optimize assets in parallel batches
        optimization_tasks = []
        
        # Image optimization
        if all_assets.images:
            optimization_tasks.append(
                self.asset_optimizer.optimize_images_batch(
                    all_assets.images, config.optimization_config.images
                )
            )
        
        # Video optimization
        if all_assets.videos:
            optimization_tasks.append(
                self.asset_optimizer.optimize_videos_batch(
                    all_assets.videos, config.optimization_config.videos
                )
            )
        
        # CSS/JS optimization
        optimization_tasks.append(
            self.asset_optimizer.optimize_static_assets(
                all_assets.static_files, config.optimization_config.static
            )
        )
        
        # Execute optimizations in parallel
        optimization_results = await asyncio.gather(*optimization_tasks)
        
        # Combine and upload to CDN
        combined_assets = self.asset_optimizer.combine_optimization_results(
            optimization_results
        )
        
        cdn_assets = await self.asset_optimizer.upload_to_cdn(
            combined_assets, config.cdn_config
        )
        
        return cdn_assets
    
    async def _apply_seo_optimizations(self, store_structure: StoreStructure,
                                     config: StoreGenerationConfig) -> SEOOptimizedStore:
        """Apply comprehensive SEO optimizations"""
        
        optimization_tasks = []
        
        for page in store_structure.pages:
            optimization_tasks.append(
                self.seo_engine.optimize_page(page, config.seo_config)
            )
        
        # Process pages in parallel
        optimized_pages = await asyncio.gather(*optimization_tasks)
        
        # Generate site-wide SEO elements
        sitemap = await self.seo_engine.generate_sitemap(optimized_pages, config)
        robots_txt = await self.seo_engine.generate_robots_txt(config)
        manifest = await self.seo_engine.generate_web_manifest(config)
        
        return SEOOptimizedStore(
            pages=optimized_pages,
            sitemap=sitemap,
            robots_txt=robots_txt,
            manifest=manifest,
            structured_data=await self.seo_engine.generate_structured_data(
                optimized_pages, config
            )
        )
    
    async def _deploy_multi_channel(self, store: SEOOptimizedStore,
                                  assets: OptimizedAssets,
                                  config: StoreGenerationConfig) -> DeploymentResults:
        """Deploy store to multiple channels simultaneously"""
        
        deployment_tasks = []
        
        for target in config.deployment_targets:
            deployment_tasks.append(
                self.deployment_gateway.deploy_to_channel(
                    store, assets, target
                )
            )
        
        # Execute deployments in parallel
        deployment_results = await asyncio.gather(
            *deployment_tasks, return_exceptions=True
        )
        
        # Process results and handle any failures
        processed_results = []
        for i, result in enumerate(deployment_results):
            target = config.deployment_targets[i]
            
            if isinstance(result, Exception):
                self.logger.error(f"Deployment to {target.type} failed: {str(result)}")
                processed_results.append(DeploymentResult(
                    target=target,
                    status="failed",
                    error=str(result),
                    timestamp=datetime.utcnow()
                ))
            else:
                processed_results.append(result)
        
        return DeploymentResults(
            deployments=processed_results,
            summary=self._generate_deployment_summary(processed_results)
        )
    
    async def _calculate_performance_metrics(self, store: SEOOptimizedStore) -> PerformanceMetrics:
        """Calculate comprehensive performance metrics"""
        
        metrics_tasks = []
        
        # Calculate Lighthouse scores for key pages
        key_pages = [p for p in store.pages if p.type in ['home', 'product', 'category']]
        
        for page in key_pages[:5]:  # Limit to 5 pages for performance
            metrics_tasks.append(
                self._calculate_lighthouse_score(page)
            )
        
        lighthouse_scores = await asyncio.gather(*metrics_tasks)
        
        # Calculate other performance metrics
        total_size = sum(page.size_bytes for page in store.pages)
        average_page_size = total_size / len(store.pages) if store.pages else 0
        
        return PerformanceMetrics(
            lighthouse_scores=lighthouse_scores,
            average_lighthouse_score=sum(lighthouse_scores) / len(lighthouse_scores),
            total_store_size=total_size,
            average_page_size=average_page_size,
            total_pages=len(store.pages),
            seo_score=await self._calculate_seo_score(store),
            accessibility_score=await self._calculate_accessibility_score(store)
        )
    
    async def _check_cache(self, config: StoreGenerationConfig) -> Optional[StoreGenerationResult]:
        """Check if cached version exists"""
        cache_key = config.generate_cache_key()
        return await self.cache_service.get_cached_store(cache_key)
    
    async def _cache_result(self, config: StoreGenerationConfig, result: StoreGenerationResult):
        """Cache generation result"""
        cache_key = config.generate_cache_key()
        await self.cache_service.cache_store(cache_key, result, ttl=3600)  # 1 hour TTL
    
    def _apply_product_filters(self, products: List[EnhancedProduct], 
                             config: StoreGenerationConfig) -> List[EnhancedProduct]:
        """Apply filters to product list"""
        filtered = products
        
        # Apply category filters
        if config.category_filters:
            filtered = [p for p in filtered if p.category_id in config.category_filters]
        
        # Apply brand filters
        if config.brand_filters:
            filtered = [p for p in filtered if p.brand_id in config.brand_filters]
        
        # Apply price filters
        if config.price_range:
            min_price, max_price = config.price_range
            filtered = [p for p in filtered if min_price <= p.price <= max_price]
        
        # Apply availability filter
        if config.only_in_stock:
            filtered = [p for p in filtered if p.availability_status == 'in_stock']
        
        # Apply sorting
        if config.sort_order:
            filtered = self._sort_products(filtered, config.sort_order)
        
        # Apply limit
        if config.max_products:
            filtered = filtered[:config.max_products]
        
        return filtered
    
    def _sort_products(self, products: List[EnhancedProduct], sort_order: str) -> List[EnhancedProduct]:
        """Sort products according to specified order"""
        sort_functions = {
            'name_asc': lambda p: p.name.lower(),
            'name_desc': lambda p: p.name.lower(),
            'price_asc': lambda p: p.price,
            'price_desc': lambda p: -p.price,
            'created_desc': lambda p: -p.created_at.timestamp(),
            'popularity': lambda p: -p.view_count,
            'relevance': lambda p: p.sort_order
        }
        
        if sort_order in sort_functions:
            products.sort(key=sort_functions[sort_order])
            if sort_order.endswith('_desc'):
                products.reverse()
        
        return products
    
    async def _calculate_lighthouse_score(self, page: OptimizedPage) -> float:
        """Calculate Lighthouse performance score for a page"""
        # This would integrate with actual Lighthouse API or library
        # For now, return estimated score based on optimizations
        base_score = 85.0
        
        # Adjust based on optimizations
        if page.has_critical_css:
            base_score += 2
        if page.has_lazy_loading:
            base_score += 2
        if page.has_webp_images:
            base_score += 2
        if page.has_minified_assets:
            base_score += 2
        if page.size_bytes < 1024 * 1024:  # Less than 1MB
            base_score += 3
        
        return min(100.0, base_score)
    
    async def _calculate_seo_score(self, store: SEOOptimizedStore) -> float:
        """Calculate overall SEO score"""
        scores = []
        
        for page in store.pages:
            page_score = 0
            
            # Check for required SEO elements
            if page.meta_title:
                page_score += 20
            if page.meta_description:
                page_score += 20
            if page.structured_data:
                page_score += 20
            if page.og_tags:
                page_score += 15
            if page.canonical_url:
                page_score += 10
            if page.has_h1_tag:
                page_score += 10
            if page.has_alt_text_for_images:
                page_score += 5
            
            scores.append(page_score)
        
        return sum(scores) / len(scores) if scores else 0
    
    async def _calculate_accessibility_score(self, store: SEOOptimizedStore) -> float:
        """Calculate accessibility compliance score"""
        scores = []
        
        for page in store.pages:
            page_score = 0
            
            # Check accessibility features
            if page.has_semantic_html:
                page_score += 25
            if page.has_aria_labels:
                page_score += 25
            if page.has_alt_text_for_images:
                page_score += 20
            if page.has_keyboard_navigation:
                page_score += 15
            if page.has_focus_indicators:
                page_score += 10
            if page.has_color_contrast_compliance:
                page_score += 5
            
            scores.append(page_score)
        
        return sum(scores) / len(scores) if scores else 0
    
    def _generate_deployment_summary(self, results: List[DeploymentResult]) -> DeploymentSummary:
        """Generate summary of deployment results"""
        successful = [r for r in results if r.status == "success"]
        failed = [r for r in results if r.status == "failed"]
        
        return DeploymentSummary(
            total_deployments=len(results),
            successful_deployments=len(successful),
            failed_deployments=len(failed),
            success_rate=len(successful) / len(results) if results else 0,
            deployment_urls=[r.url for r in successful if r.url],
            errors=[r.error for r in failed if r.error]
        )

class StoreGenerationError(Exception):
    """Custom exception for store generation errors"""
    pass

class DataQualityError(StoreGenerationError):
    """Exception for data quality issues"""
    pass
```

### 2. Template Engine Architecture

**File**: `src/store_generation/templates/engine.py`

```python
from typing import Dict, List, Any, Optional
from pathlib import Path
import yaml
import jinja2
from jinja2 import Environment, FileSystemLoader, select_autoescape
import aiofiles
import asyncio
from dataclasses import dataclass

@dataclass
class TemplateConfig:
    """Configuration for template rendering"""
    template_id: str
    theme_settings: Dict[str, Any]
    component_overrides: Dict[str, Any]
    responsive_breakpoints: Dict[str, int]
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None

@dataclass
class ComponentConfig:
    """Configuration for individual components"""
    component_type: str
    props: Dict[str, Any]
    styling: Dict[str, Any]
    behavior: Dict[str, Any]

class TemplateEngine:
    """
    Advanced template engine with component-based architecture.
    
    Features:
    - Modular component system
    - Template inheritance
    - Dynamic theme application
    - Responsive design patterns
    - Performance optimization
    """
    
    def __init__(self, templates_dir: str = "templates"):
        self.templates_dir = Path(templates_dir)
        self.component_library = ComponentLibrary()
        self.template_cache = TemplateCache()
        self.theme_processor = ThemeProcessor()
        
        # Initialize Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Register custom filters and functions
        self._register_custom_filters()
        self._register_global_functions()
    
    async def process_product_chunk(self, products: List[EnhancedProduct], 
                                  config: TemplateConfig) -> ChunkResult:
        """Process a chunk of products for parallel processing"""
        
        # Load template configuration
        template_config = await self._load_template_config(config.template_id)
        
        # Generate product pages for this chunk
        product_pages = []
        for product in products:
            page = await self._generate_product_page(product, template_config, config)
            product_pages.append(page)
        
        # Generate category pages if needed
        category_pages = await self._generate_category_pages_for_chunk(
            products, template_config, config
        )
        
        return ChunkResult(
            product_pages=product_pages,
            category_pages=category_pages,
            assets=template_config.assets
        )
    
    async def combine_chunk_results(self, chunk_results: List[ChunkResult],
                                  config: TemplateConfig) -> StoreStructure:
        """Combine results from parallel chunk processing"""
        
        all_product_pages = []
        all_category_pages = []
        all_assets = []
        
        for chunk in chunk_results:
            all_product_pages.extend(chunk.product_pages)
            all_category_pages.extend(chunk.category_pages)
            all_assets.extend(chunk.assets)
        
        # Deduplicate category pages
        unique_categories = {}
        for cat_page in all_category_pages:
            if cat_page.category_id not in unique_categories:
                unique_categories[cat_page.category_id] = cat_page
            else:
                # Merge products from multiple chunks
                unique_categories[cat_page.category_id].products.extend(cat_page.products)
        
        # Generate additional pages
        home_page = await self._generate_home_page(all_product_pages, config)
        search_page = await self._generate_search_page(config)
        
        return StoreStructure(
            pages=[home_page, search_page] + all_product_pages + list(unique_categories.values()),
            assets=all_assets,
            navigation=await self._generate_navigation(unique_categories.values()),
            metadata=await self._generate_store_metadata(config)
        )
    
    async def _generate_product_page(self, product: EnhancedProduct,
                                   template_config: Dict[str, Any],
                                   config: TemplateConfig) -> ProductPage:
        """Generate individual product page"""
        
        # Load product page template
        template = self.jinja_env.get_template(
            f"{config.template_id}/pages/product.html"
        )
        
        # Prepare template context
        context = {
            'product': product,
            'theme': config.theme_settings,
            'components': await self._get_product_page_components(product, config),
            'recommendations': await self._get_product_recommendations(product),
            'face_shape_data': product.face_shape_scores,
            'related_products': await self._get_related_products(product),
            'reviews': await self._get_product_reviews(product.id),
            'availability': await self._get_availability_info(product),
            'pricing': await self._get_pricing_info(product),
            'breadcrumbs': await self._generate_breadcrumbs(product)
        }
        
        # Render template
        html_content = await self._render_template_async(template, context)
        
        # Apply theme modifications
        themed_content = await self.theme_processor.apply_theme(
            html_content, config.theme_settings
        )
        
        return ProductPage(
            product_id=product.id,
            url_path=f"/products/{product.slug}",
            title=f"{product.name} | {product.brand.name}",
            content=themed_content,
            meta_data=await self._generate_product_meta(product),
            structured_data=await self._generate_product_structured_data(product),
            assets=await self._extract_page_assets(themed_content)
        )
    
    async def _generate_category_pages_for_chunk(self, products: List[EnhancedProduct],
                                               template_config: Dict[str, Any],
                                               config: TemplateConfig) -> List[CategoryPage]:
        """Generate category pages for products in this chunk"""
        
        # Group products by category
        categories = {}
        for product in products:
            if product.category_id not in categories:
                categories[product.category_id] = {
                    'category': product.category,
                    'products': []
                }
            categories[product.category_id]['products'].append(product)
        
        # Generate category pages
        category_pages = []
        for category_id, category_data in categories.items():
            page = await self._generate_single_category_page(
                category_data['category'],
                category_data['products'],
                template_config,
                config
            )
            category_pages.append(page)
        
        return category_pages
    
    async def _generate_single_category_page(self, category: Category,
                                           products: List[EnhancedProduct],
                                           template_config: Dict[str, Any],
                                           config: TemplateConfig) -> CategoryPage:
        """Generate a single category page"""
        
        # Load category page template
        template = self.jinja_env.get_template(
            f"{config.template_id}/pages/category.html"
        )
        
        # Prepare template context
        context = {
            'category': category,
            'products': products,
            'theme': config.theme_settings,
            'filters': await self._get_category_filters(category, products),
            'sorting_options': await self._get_sorting_options(),
            'pagination': await self._calculate_pagination(products, config),
            'breadcrumbs': await self._generate_category_breadcrumbs(category),
            'seo_content': await self._get_category_seo_content(category)
        }
        
        # Render template
        html_content = await self._render_template_async(template, context)
        
        # Apply theme modifications
        themed_content = await self.theme_processor.apply_theme(
            html_content, config.theme_settings
        )
        
        return CategoryPage(
            category_id=category.id,
            url_path=f"/categories/{category.slug}",
            title=f"{category.name} | Eyewear Collection",
            content=themed_content,
            products=products,
            meta_data=await self._generate_category_meta(category),
            assets=await self._extract_page_assets(themed_content)
        )
    
    async def _generate_home_page(self, product_pages: List[ProductPage],
                                config: TemplateConfig) -> HomePage:
        """Generate store home page"""
        
        # Load home page template
        template = self.jinja_env.get_template(
            f"{config.template_id}/pages/home.html"
        )
        
        # Select featured products
        featured_products = await self._select_featured_products(product_pages)
        
        # Prepare template context
        context = {
            'featured_products': featured_products,
            'categories': await self._get_home_categories(),
            'hero_content': config.theme_settings.get('hero_content'),
            'theme': config.theme_settings,
