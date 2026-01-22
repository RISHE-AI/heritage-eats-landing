import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-7 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export const ReviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Rating summary skeleton */}
      <div className="flex gap-6 p-4 bg-secondary/30 rounded-xl">
        <div className="text-center">
          <Skeleton className="h-10 w-16 mx-auto" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((i) => (
            <Skeleton key={i} className="h-2 w-full" />
          ))}
        </div>
      </div>
      
      {/* Review items skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-secondary/20">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-16 w-full mt-3" />
        </div>
      ))}
    </div>
  );
};

export const CheckoutSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 p-3 rounded-lg bg-secondary/30">
          <Skeleton className="h-16 w-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
