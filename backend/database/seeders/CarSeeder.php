<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Car;
use App\Models\User;
use Illuminate\Support\Str;

class CarSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create a seller user
        $seller = User::where('email', 'seller@example.com')->first();
        
        if (!$seller) {
            $seller = User::create([
                'id' => (string) Str::uuid(),
                'name' => 'Seller',
                'email' => 'seller@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        $carsData = [
            [
                'make' => 'Toyota',
                'model' => 'Camry',
                'year' => 2022,
                'price' => 25000,
                'mileage' => 15000,
                'condition' => 'used',
                'location' => 'New York, NY',
                'description' => 'Well-maintained Toyota Camry with full service history.',
            ],
            [
                'make' => 'Honda',
                'model' => 'Civic',
                'year' => 2021,
                'price' => 22000,
                'mileage' => 28000,
                'condition' => 'used',
                'location' => 'Los Angeles, CA',
                'description' => 'Reliable Honda Civic in excellent condition.',
            ],
            [
                'make' => 'Ford',
                'model' => 'Mustang',
                'year' => 2023,
                'price' => 45000,
                'mileage' => 5000,
                'condition' => 'new',
                'location' => 'Chicago, IL',
                'description' => 'Brand new Ford Mustang with all latest features.',
            ],
            [
                'make' => 'BMW',
                'model' => '3 Series',
                'year' => 2020,
                'price' => 35000,
                'mileage' => 42000,
                'condition' => 'used',
                'location' => 'Houston, TX',
                'description' => 'Luxury BMW 3 Series with premium features.',
            ],
            [
                'make' => 'Mercedes-Benz',
                'model' => 'C-Class',
                'year' => 2019,
                'price' => 32000,
                'mileage' => 55000,
                'condition' => 'used',
                'location' => 'Phoenix, AZ',
                'description' => 'Classic Mercedes-Benz C-Class sedan.',
            ],
            [
                'make' => 'Volkswagen',
                'model' => 'Golf',
                'year' => 2022,
                'price' => 23000,
                'mileage' => 18000,
                'condition' => 'used',
                'location' => 'Miami, FL',
                'description' => 'Compact and efficient Volkswagen Golf.',
            ],
            [
                'make' => 'Audi',
                'model' => 'A4',
                'year' => 2021,
                'price' => 38000,
                'mileage' => 32000,
                'condition' => 'used',
                'location' => 'Denver, CO',
                'description' => 'Premium Audi A4 with advanced technology.',
            ],
            [
                'make' => 'Mazda',
                'model' => 'CX-5',
                'year' => 2023,
                'price' => 28000,
                'mileage' => 8000,
                'condition' => 'used',
                'location' => 'Seattle, WA',
                'description' => 'Stylish Mazda CX-5 SUV with excellent fuel efficiency.',
            ],
            [
                'make' => 'Tesla',
                'model' => 'Model 3',
                'year' => 2022,
                'price' => 42000,
                'mileage' => 12000,
                'condition' => 'used',
                'location' => 'Boston, MA',
                'description' => 'Electric Tesla Model 3 with autopilot features.',
            ],
            [
                'make' => 'Hyundai',
                'model' => 'Elantra',
                'year' => 2023,
                'price' => 20000,
                'mileage' => 3000,
                'condition' => 'new',
                'location' => 'Portland, OR',
                'description' => 'Budget-friendly Hyundai Elantra with modern features.',
            ],
        ];

        foreach ($carsData as $carData) {
            $car = Car::create([
                'id' => (string) Str::uuid(),
                'seller_id' => $seller->id,
                'make' => $carData['make'],
                'model' => $carData['model'],
                'year' => $carData['year'],
                'price' => $carData['price'],
                'mileage' => $carData['mileage'],
                'condition' => $carData['condition'],
                'location' => $carData['location'],
                'description' => $carData['description'],
                'status' => Car::STATUS_APPROVED,
                'approved_at' => now(),
                'published_at' => now(),
            ]);

            // Add sample image for each car
            $imageUrls = [
                'https://images.unsplash.com/photo-1552519507-da3effff991c?w=500&h=400&fit=crop',
                'https://images.unsplash.com/photo-1617654112368-307921291f42?w=500&h=400&fit=crop',
                'https://images.unsplash.com/photo-1609708536965-59e41b1b4200?w=500&h=400&fit=crop',
                'https://images.unsplash.com/photo-1617469767537-b85ba699c72d?w=500&h=400&fit=crop',
            ];
            
            $car->images()->create([
                'path' => $imageUrls[array_rand($imageUrls)],
                'alt' => $carData['make'] . ' ' . $carData['model'],
                'is_cover' => true,
                'position' => 0,
            ]);
        }
    }
}
