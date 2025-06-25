<?php
namespace EyewearML\Core\Model\Product\Attribute;

use Magento\Catalog\Model\Product;
use Magento\Eav\Setup\EavSetup;
use Magento\Eav\Setup\EavSetupFactory;
use Magento\Framework\Setup\ModuleDataSetupInterface;

class Management
{
    /**
     * @var EavSetupFactory
     */
    private $eavSetupFactory;

    /**
     * @var ModuleDataSetupInterface
     */
    private $moduleDataSetup;

    /**
     * @param EavSetupFactory $eavSetupFactory
     * @param ModuleDataSetupInterface $moduleDataSetup
     */
    public function __construct(
        EavSetupFactory $eavSetupFactory,
        ModuleDataSetupInterface $moduleDataSetup
    ) {
        $this->eavSetupFactory = $eavSetupFactory;
        $this->moduleDataSetup = $moduleDataSetup;
    }

    /**
     * Install product attributes
     *
     * @return void
     */
    public function installAttributes()
    {
        /** @var EavSetup $eavSetup */
        $eavSetup = $this->eavSetupFactory->create(['setup' => $this->moduleDataSetup]);

        // Frame Measurements
        $this->createFrameMeasurementAttributes($eavSetup);

        // Virtual Try-On
        $this->createVirtualTryOnAttributes($eavSetup);

        // Style Tags
        $this->createStyleAttributes($eavSetup);
    }

    /**
     * Create frame measurement attributes
     *
     * @param EavSetup $eavSetup
     */
    private function createFrameMeasurementAttributes($eavSetup)
    {
        $attributes = [
            'frame_width' => [
                'label' => 'Frame Width (mm)',
                'type' => 'decimal',
                'input' => 'text',
                'required' => false,
                'sort_order' => 10,
                'validate_rules' => '{"min_text_length":0,"max_text_length":10,"input_validation":"decimal"}',
            ],
            'frame_bridge' => [
                'label' => 'Bridge Width (mm)',
                'type' => 'decimal',
                'input' => 'text',
                'required' => false,
                'sort_order' => 20,
                'validate_rules' => '{"min_text_length":0,"max_text_length":10,"input_validation":"decimal"}',
            ],
            'frame_temple' => [
                'label' => 'Temple Length (mm)',
                'type' => 'decimal',
                'input' => 'text',
                'required' => false,
                'sort_order' => 30,
                'validate_rules' => '{"min_text_length":0,"max_text_length":10,"input_validation":"decimal"}',
            ],
            'frame_lens_height' => [
                'label' => 'Lens Height (mm)',
                'type' => 'decimal',
                'input' => 'text',
                'required' => false,
                'sort_order' => 40,
                'validate_rules' => '{"min_text_length":0,"max_text_length":10,"input_validation":"decimal"}',
            ],
            'frame_lens_width' => [
                'label' => 'Lens Width (mm)',
                'type' => 'decimal',
                'input' => 'text',
                'required' => false,
                'sort_order' => 50,
                'validate_rules' => '{"min_text_length":0,"max_text_length":10,"input_validation":"decimal"}',
            ],
            'frame_weight' => [
                'label' => 'Frame Weight (g)',
                'type' => 'decimal',
                'input' => 'text',
                'required' => false,
                'sort_order' => 60,
                'validate_rules' => '{"min_text_length":0,"max_text_length":10,"input_validation":"decimal"}',
            ],
        ];

        foreach ($attributes as $code => $config) {
            $this->createAttribute($eavSetup, $code, array_merge([
                'group' => 'Frame Measurements',
                'note' => 'EyewearML: ' . $config['label'],
            ], $config));
        }
    }

    /**
     * Create virtual try-on attributes
     *
     * @param EavSetup $eavSetup
     */
    private function createVirtualTryOnAttributes($eavSetup)
    {
        $attributes = [
            'enable_virtual_try_on' => [
                'label' => 'Enable Virtual Try-On',
                'type' => 'int',
                'input' => 'boolean',
                'source' => 'Magento\Eav\Model\Entity\Attribute\Source\Boolean',
                'required' => false,
                'sort_order' => 10,
            ],
            'virtual_try_on_model' => [
                'label' => '3D Model File',
                'type' => 'varchar',
                'input' => 'text',
                'required' => false,
                'sort_order' => 20,
            ],
        ];

        foreach ($attributes as $code => $config) {
            $this->createAttribute($eavSetup, $code, array_merge([
                'group' => 'Virtual Try-On',
                'note' => 'EyewearML: ' . $config['label'],
            ], $config));
        }
    }

    /**
     * Create style attributes
     *
     * @param EavSetup $eavSetup
     */
    private function createStyleAttributes($eavSetup)
    {
        $attributes = [
            'style_tags' => [
                'label' => 'Style Tags',
                'type' => 'text',
                'input' => 'textarea',
                'required' => false,
                'sort_order' => 10,
                'note' => 'Comma-separated tags to improve style-based recommendations',
            ],
            'frame_color_code' => [
                'label' => 'Frame Color Code',
                'type' => 'varchar',
                'input' => 'text',
                'required' => false,
                'sort_order' => 20,
            ],
            'frame_finish' => [
                'label' => 'Frame Finish',
                'type' => 'varchar',
                'input' => 'text',
                'required' => false,
                'sort_order' => 30,
            ],
        ];

        foreach ($attributes as $code => $config) {
            $this->createAttribute($eavSetup, $code, array_merge([
                'group' => 'Style Information',
                'note' => 'EyewearML: ' . $config['label'],
            ], $config));
        }
    }

    /**
     * Create product attribute
     *
     * @param EavSetup $eavSetup
     * @param string $code
     * @param array $config
     */
    private function createAttribute($eavSetup, $code, $config)
    {
        $defaultConfig = [
            'type' => 'varchar',
            'backend' => '',
            'frontend' => '',
            'label' => ucwords(str_replace('_', ' ', $code)),
            'input' => 'text',
            'class' => '',
            'source' => '',
            'global' => \Magento\Eav\Model\Entity\Attribute\ScopedAttributeInterface::SCOPE_STORE,
            'visible' => true,
            'required' => false,
            'user_defined' => true,
            'default' => '',
            'searchable' => false,
            'filterable' => false,
            'comparable' => false,
            'visible_on_front' => false,
            'used_in_product_listing' => true,
            'unique' => false,
            'apply_to' => '',
            'group' => 'General',
            'note' => '',
        ];

        $config = array_merge($defaultConfig, $config);

        $eavSetup->addAttribute(
            Product::ENTITY,
            'eyewearml_' . $code,
            $config
        );
    }

    /**
     * Get frame measurements
     *
     * @param Product $product
     * @return array
     */
    public function getFrameMeasurements($product)
    {
        return [
            'width' => $product->getData('eyewearml_frame_width'),
            'bridge' => $product->getData('eyewearml_frame_bridge'),
            'temple' => $product->getData('eyewearml_frame_temple'),
            'lens_height' => $product->getData('eyewearml_frame_lens_height'),
            'lens_width' => $product->getData('eyewearml_frame_lens_width'),
            'weight' => $product->getData('eyewearml_frame_weight'),
        ];
    }

    /**
     * Get style data
     *
     * @param Product $product
     * @return array
     */
    public function getStyleData($product)
    {
        return [
            'tags' => array_filter(array_map('trim', explode(',', $product->getData('eyewearml_style_tags')))),
            'color_code' => $product->getData('eyewearml_frame_color_code'),
            'finish' => $product->getData('eyewearml_frame_finish'),
        ];
    }

    /**
     * Check if virtual try-on is enabled
     *
     * @param Product $product
     * @return bool
     */
    public function isVirtualTryOnEnabled($product)
    {
        return (bool) $product->getData('eyewearml_enable_virtual_try_on');
    }

    /**
     * Get virtual try-on model
     *
     * @param Product $product
     * @return string|null
     */
    public function getVirtualTryOnModel($product)
    {
        return $product->getData('eyewearml_virtual_try_on_model');
    }
}
