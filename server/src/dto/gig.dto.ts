import { GigStatus } from '@prisma/client';
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsOptional,
    MaxLength,
    MinLength,
    IsEnum,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new gig
 */
export class CreateGigDto {
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    @MinLength(3, { message: 'Title must be at least 3 characters' })
    @MaxLength(100, { message: 'Title must not exceed 100 characters' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    @MinLength(10, { message: 'Description must be at least 10 characters' })
    @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
    description: string;

    @IsNumber({}, { message: 'Budget must be a valid number' })
    @IsPositive({ message: 'Budget must be a positive number' })
    @Type(() => Number)
    budget: number;
}

/**
 * DTO for updating an existing gig
 */
export class UpdateGigDto {
    @IsString()
    @IsOptional()
    @MinLength(3, { message: 'Title must be at least 3 characters' })
    @MaxLength(100, { message: 'Title must not exceed 100 characters' })
    title?: string;

    @IsString()
    @IsOptional()
    @MinLength(10, { message: 'Description must be at least 10 characters' })
    @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
    description?: string;

    @IsNumber({}, { message: 'Budget must be a valid number' })
    @IsPositive({ message: 'Budget must be a positive number' })
    @IsOptional()
    @Type(() => Number)
    budget?: number;
}

/**
 * DTO for querying/filtering gigs
 */
export class GigQueryDto {
    @IsOptional()
    @IsString()
    search?: string; // Search by title

    @IsOptional()
    @IsEnum(GigStatus, { message: 'Status must be OPEN or ASSIGNED' })
    status?: GigStatus;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number;
}
