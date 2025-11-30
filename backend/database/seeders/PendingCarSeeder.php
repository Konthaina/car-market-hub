<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Car;
use App\Models\User;
use Illuminate\Support\Str;

class PendingCarSeeder extends Seeder
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
                'make' => 'Chevrolet',
                'model' => 'Silverado',
                'year' => 2023,
                'price' => 55000,
                'mileage' => 12000,
                'condition' => 'used',
                'location' => 'Austin, TX',
                'description' => 'Powerful Chevrolet Silverado pickup truck with towing package.',
            ],
            [
                'make' => 'Nissan',
                'model' => 'Altima',
                'year' => 2022,
                'price' => 24500,
                'mileage' => 22000,
                'condition' => 'used',
                'location' => 'San Diego, CA',
                'description' => 'Smooth driving Nissan Altima with cruise control and backup camera.',
            ],
            [
                'make' => 'Subaru',
                'model' => 'Outback',
                'year' => 2021,
                'price' => 29000,
                'mileage' => 35000,
                'condition' => 'used',
                'location' => 'Portland, OR',
                'description' => 'All-wheel drive Subaru Outback perfect for adventurers.',
            ],
            [
                'make' => 'Kia',
                'model' => 'Sorento',
                'year' => 2023,
                'price' => 31000,
                'mileage' => 8000,
                'condition' => 'new',
                'location' => 'Atlanta, GA',
                'description' => 'Spacious and modern Kia Sorento SUV with latest tech.',
            ],
            [
                'make' => 'Lexus',
                'model' => 'RX 350',
                'year' => 2020,
                'price' => 48000,
                'mileage' => 45000,
                'condition' => 'used',
                'location' => 'Miami, FL',
                'description' => 'Luxury Lexus RX 350 with premium interior and smooth ride.',
            ],
            [
                'make' => 'Hyundai',
                'model' => 'Santa Fe',
                'year' => 2022,
                'price' => 32000,
                'mileage' => 19000,
                'condition' => 'used',
                'location' => 'Dallas, TX',
                'description' => 'Family-friendly Hyundai Santa Fe with excellent warranty.',
            ],
            [
                'make' => 'Toyota',
                'model' => 'Highlander',
                'year' => 2023,
                'price' => 50000,
                'mileage' => 10000,
                'condition' => 'new',
                'location' => 'San Francisco, CA',
                'description' => 'Three-row Toyota Highlander perfect for large families.',
            ],
            [
                'make' => 'Volkswagen',
                'model' => 'Jetta',
                'year' => 2021,
                'price' => 20000,
                'mileage' => 31000,
                'condition' => 'used',
                'location' => 'Las Vegas, NV',
                'description' => 'Efficient Volkswagen Jetta sedan with good fuel economy.',
            ],
            [
                'make' => 'Jeep',
                'model' => 'Wrangler',
                'year' => 2022,
                'price' => 43000,
                'mileage' => 15000,
                'condition' => 'used',
                'location' => 'Denver, CO',
                'description' => 'Off-road capable Jeep Wrangler with removable top.',
            ],
            [
                'make' => 'Ram',
                'model' => '1500',
                'year' => 2023,
                'price' => 52000,
                'mileage' => 9000,
                'condition' => 'new',
                'location' => 'Phoenix, AZ',
                'description' => 'Heavy-duty Ram 1500 pickup with innovative features.',
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
                'status' => Car::STATUS_PENDING,
                // NO approved_at, published_at — these remain null for pending status
            ]);

            // Add sample image for each car
            $imagePaths = [
                'cars/car-1.jpg',
                'cars/car-2.jpg',
                'cars/car-3.jpg',
                'cars/car-4.jpg',
            ];
            
            $car->images()->create([
                'path' => $imagePaths[array_rand($imagePaths)],
                'alt' => $carData['make'] . ' ' . $carData['model'],
                'is_cover' => true,
                'position' => 0,
            ]);
        }
    }
}
