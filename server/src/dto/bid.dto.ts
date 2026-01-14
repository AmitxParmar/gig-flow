import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsOptional,
    MaxLength,
    MinLength,
    IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new bid
 */
export class CreateBidDto {
    @IsString()
    @IsNotEmpty({ message: 'Gig ID is required' })
    @IsMongoId({ message: 'Invalid Gig ID format' })
    gigId: string;

    @IsString()
    @IsNotEmpty({ message: 'Message is required' })
    @MinLength(10, { message: 'Message must be at least 10 characters' })
    @MaxLength(1000, { message: 'Message must not exceed 1000 characters' })
    message: string;

    @IsNumber({}, { message: 'Price must be a valid number' })
    @IsPositive({ message: 'Price must be a positive number' })
    @Type(() => Number)
    price: number;
}

/**
 * DTO for updating an existing bid (only before hiring)
 */
export class UpdateBidDto {
    @IsString()
    @IsOptional()
    @MinLength(10, { message: 'Message must be at least 10 characters' })
    @MaxLength(1000, { message: 'Message must not exceed 1000 characters' })
    message?: string;

    @IsNumber({}, { message: 'Price must be a valid number' })
    @IsPositive({ message: 'Price must be a positive number' })
    @IsOptional()
    @Type(() => Number)
    price?: number;
}
