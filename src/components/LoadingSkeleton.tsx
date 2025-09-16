import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Specific loading skeletons for different components

export const QuoteFormSkeleton: React.FC = () => {
  return (
    <div className="austin-card p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Upload area */}
      <div>
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      {/* Submit button */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
};

export const MediaUploadSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <Skeleton className="h-40 w-full rounded-lg" />

      {/* File previews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ItemizedQuoteSkeleton: React.FC = () => {
  return (
    <div className="austin-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4">
        <div className="bg-gradient-to-r from-austin-blue/5 to-austin-green/5 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>

          <div className="space-y-2 mb-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex justify-between py-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const NeighborhoodCardSkeleton: React.FC = () => {
  return (
    <div className="austin-card p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-5 w-16 ml-4" />
      </div>

      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    </div>
  );
};

export const BlogPostSkeleton: React.FC = () => {
  return (
    <article className="austin-card p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-lg" />

      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    </article>
  );
};

// Loading states with Austin branding
export const AustinLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-austin-blue border-t-transparent',
        sizeClasses[size]
      )} />
    </div>
  );
};

export const AustinLoadingCard: React.FC<{ title?: string; message?: string }> = ({
  title = 'Loading...',
  message = 'Preparing your Austin moving experience'
}) => {
  return (
    <div className="austin-card p-8 text-center">
      <AustinLoadingSpinner size="lg" className="mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export { Skeleton };