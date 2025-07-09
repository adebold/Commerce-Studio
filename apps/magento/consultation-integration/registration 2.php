<?php
/**
 * Magento Consultation Integration Module Registration
 * Commerce Studio Consultation MVP - Magento Integration
 */

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(
    ComponentRegistrar::MODULE,
    'CommerceStudio_ConsultationIntegration',
    __DIR__
);