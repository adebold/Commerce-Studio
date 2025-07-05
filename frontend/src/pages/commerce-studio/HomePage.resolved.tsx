import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CircularProgress,
  Divider,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { ButtonProps } from '@mui/material/Button';
import { useAuth, RBAC } from '../../components/auth/AuthProvider';
import { Role } from '../../services/auth';
import MetricCard from '../../components/dashboard/MetricCard';
import ServiceStatus from '../../components/dashboard/ServiceStatus';
import { metricsService } from '../../services/metrics';
import {
  commerceStudioService,
  Product,
  PricingPlan,
} from "../../services/commerce-studio";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { MLMetrics, DataPipelineMetrics, APIMetrics, BusinessMetrics, SystemMetrics, ServiceStatus as ServiceStatusType } from '../../services/metrics';