using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Identity;
using Moveli.Domain.Entities;
using Moveli.Domain.ValueObjects;

namespace Moveli.API.Infrastructure.Data;

public static class MoveliDbContextSeed
{
    public static async Task SeedAsync(MoveliDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        // Serialize seeding across instances: if two app instances boot together (load-balanced
        // deploy) the loser waits on the advisory lock, then sees populated tables and skips —
        // instead of crashing on a unique-slug/role violation. Lock releases on commit.
        await using var tx = await context.Database.BeginTransactionAsync();
        if (context.Database.IsNpgsql())
            await context.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(548273)");

        await SeedRolesAsync(roleManager);
        await SeedUsersAsync(userManager);

        if (!context.Categories.Any())
        {
            var categories = GetCategories();
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        if (!context.Brands.Any())
        {
            var brands = GetBrands();
            context.Brands.AddRange(brands);
            await context.SaveChangesAsync();
        }

        if (!context.Products.Any())
        {
            var categories = context.Categories.ToList();
            var brands = context.Brands.ToList();
            var products = GetProducts(categories, brands);
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }

        // Seed the singleton settings row so SettingsRepository.GetAsync never races to create it.
        if (!context.StoreSettings.Any())
        {
            context.StoreSettings.Add(new StoreSettings());
            await context.SaveChangesAsync();
        }

        await tx.CommitAsync();
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        string[] roles = ["Admin", "Customer"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid> { Name = role });
        }
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager)
    {
        if (await userManager.FindByEmailAsync("admin@moveli.ge") == null)
        {
            var admin = new ApplicationUser
            {
                UserName = "admin@moveli.ge",
                Email = "admin@moveli.ge",
                FirstName = "ადმინი",
                LastName = "მოველი",
                PreferredLanguage = "ka",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(admin, "Admin123!");
            await userManager.AddToRoleAsync(admin, "Admin");
        }

        if (await userManager.FindByEmailAsync("user@moveli.ge") == null)
        {
            var user = new ApplicationUser
            {
                UserName = "user@moveli.ge",
                Email = "user@moveli.ge",
                FirstName = "გიორგი",
                LastName = "ბერიძე",
                PreferredLanguage = "ka",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(user, "User123!");
            await userManager.AddToRoleAsync(user, "Customer");
        }
    }

    private static List<Category> GetCategories()
    {
        var electronics = new Category
        {
            Name = new LocalizedString("ელექტრონიკა", "Electronics"),
            Slug = "electronics",
            Description = new LocalizedString("ელექტრონული მოწყობილობები და გაჯეტები", "Electronic devices and gadgets"),
            SortOrder = 1,
            ImageUrl = "https://placehold.co/400x400/8B7DD8/ffffff?text=Electronics"
        };

        var phones = new Category
        {
            Name = new LocalizedString("მობილური ტელეფონები", "Mobile Phones"),
            Slug = "mobile-phones",
            Description = new LocalizedString("სმარტფონები და მობილური ტელეფონები", "Smartphones and mobile phones"),
            Parent = electronics,
            SortOrder = 1,
            ImageUrl = "https://placehold.co/400x400/7BC8E6/ffffff?text=Phones"
        };

        var laptops = new Category
        {
            Name = new LocalizedString("ლეპტოპები", "Laptops"),
            Slug = "laptops",
            Description = new LocalizedString("ლეპტოპები და ნოუთბუქები", "Laptops and notebooks"),
            Parent = electronics,
            SortOrder = 2,
            ImageUrl = "https://placehold.co/400x400/6B8DD6/ffffff?text=Laptops"
        };

        var homeAppliances = new Category
        {
            Name = new LocalizedString("საყოფაცხოვრებო ტექნიკა", "Home Appliances"),
            Slug = "home-appliances",
            Description = new LocalizedString("საყოფაცხოვრებო ტექნიკა და აპარატურა", "Home appliances and equipment"),
            SortOrder = 2,
            ImageUrl = "https://placehold.co/400x400/A8DCEC/333333?text=Home"
        };

        var kitchen = new Category
        {
            Name = new LocalizedString("სამზარეულო", "Kitchen"),
            Slug = "kitchen-appliances",
            Description = new LocalizedString("სამზარეულოს ტექნიკა", "Kitchen appliances"),
            Parent = homeAppliances,
            SortOrder = 1,
            ImageUrl = "https://placehold.co/400x400/C9C0F3/333333?text=Kitchen"
        };

        var clothing = new Category
        {
            Name = new LocalizedString("ტანსაცმელი", "Clothing"),
            Slug = "clothing",
            Description = new LocalizedString("მამაკაცის და ქალის ტანსაცმელი", "Men's and women's clothing"),
            SortOrder = 3,
            ImageUrl = "https://placehold.co/400x400/B5C9EF/333333?text=Clothing"
        };

        var sports = new Category
        {
            Name = new LocalizedString("სპორტი", "Sports"),
            Slug = "sports",
            Description = new LocalizedString("სპორტული ტანსაცმელი და ინვენტარი", "Sports clothing and equipment"),
            SortOrder = 4,
            ImageUrl = "https://placehold.co/400x400/8FD7E9/333333?text=Sports"
        };

        var audio = new Category
        {
            Name = new LocalizedString("აუდიო და ვიდეო", "Audio & Video"),
            Slug = "audio-video",
            Description = new LocalizedString("აუდიო და ვიდეო ტექნიკა", "Audio and video equipment"),
            Parent = electronics,
            SortOrder = 3,
            ImageUrl = "https://placehold.co/400x400/9B8FE0/ffffff?text=Audio"
        };

        return [electronics, phones, laptops, homeAppliances, kitchen, clothing, sports, audio];
    }

    private static List<Brand> GetBrands()
    {
        return
        [
            new Brand { Name = "Samsung", Slug = "samsung", LogoUrl = "https://placehold.co/200x80/1428A0/ffffff?text=Samsung" },
            new Brand { Name = "Apple", Slug = "apple", LogoUrl = "https://placehold.co/200x80/333333/ffffff?text=Apple" },
            new Brand { Name = "Bosch", Slug = "bosch", LogoUrl = "https://placehold.co/200x80/E20015/ffffff?text=Bosch" },
            new Brand { Name = "Nike", Slug = "nike", LogoUrl = "https://placehold.co/200x80/111111/ffffff?text=Nike" },
            new Brand { Name = "Sony", Slug = "sony", LogoUrl = "https://placehold.co/200x80/000000/ffffff?text=Sony" }
        ];
    }

    private static List<Product> GetProducts(List<Category> categories, List<Brand> brands)
    {
        var phones = categories.First(c => c.Slug == "mobile-phones");
        var laptopsCategory = categories.First(c => c.Slug == "laptops");
        var kitchen = categories.First(c => c.Slug == "kitchen-appliances");
        var clothing = categories.First(c => c.Slug == "clothing");
        var sports = categories.First(c => c.Slug == "sports");
        var audio = categories.First(c => c.Slug == "audio-video");

        var samsung = brands.First(b => b.Slug == "samsung");
        var apple = brands.First(b => b.Slug == "apple");
        var bosch = brands.First(b => b.Slug == "bosch");
        var nike = brands.First(b => b.Slug == "nike");
        var sony = brands.First(b => b.Slug == "sony");

        return
        [
            CreateProduct("Samsung Galaxy S24 Ultra", "სამსუნგ გალაქსი S24 ულტრა",
                "Flagship smartphone with S Pen and 200MP camera", "ფლაგმანი სმარტფონი S Pen-ით და 200MP კამერით",
                "galaxy-s24-ultra", "SM-S928B", 3899.00m, 4299.00m, phones, samsung, 25, true, true, 4.8m, 124),

            CreateProduct("Samsung Galaxy A55", "სამსუნგ გალაქსი A55",
                "Mid-range smartphone with great camera", "საშუალო კლასის სმარტფონი შესანიშნავი კამერით",
                "galaxy-a55", "SM-A556B", 1299.00m, null, phones, samsung, 50, true, false, 4.5m, 89),

            CreateProduct("iPhone 15 Pro Max", "აიფონი 15 პრო მაქს",
                "Apple's most advanced iPhone with titanium design", "Apple-ის ყველაზე მოწინავე iPhone ტიტანის დიზაინით",
                "iphone-15-pro-max", "A3106", 4599.00m, null, phones, apple, 15, true, true, 4.9m, 201),

            CreateProduct("iPhone 15", "აიფონი 15",
                "Dynamic Island, 48MP camera, USB-C", "Dynamic Island, 48MP კამერა, USB-C",
                "iphone-15", "A3090", 3199.00m, 3499.00m, phones, apple, 30, true, false, 4.7m, 156),

            CreateProduct("Samsung Galaxy Book4 Pro", "სამსუნგ გალაქსი ბუქ4 პრო",
                "14-inch AMOLED laptop with Intel Core Ultra", "14 ინჩიანი AMOLED ლეპტოპი Intel Core Ultra-ით",
                "galaxy-book4-pro", "NP940XGK", 4299.00m, null, laptopsCategory, samsung, 10, true, true, 4.6m, 45),

            CreateProduct("MacBook Air M3", "მაკბუქ ეარ M3",
                "Ultra-thin laptop with Apple M3 chip", "ულტრა-თხელი ლეპტოპი Apple M3 ჩიპით",
                "macbook-air-m3", "MRXN3", 4999.00m, 5299.00m, laptopsCategory, apple, 12, true, true, 4.8m, 178),

            CreateProduct("MacBook Pro 14 M3 Pro", "მაკბუქ პრო 14 M3 პრო",
                "Professional laptop with M3 Pro chip", "პროფესიონალური ლეპტოპი M3 Pro ჩიპით",
                "macbook-pro-14-m3-pro", "MRX33", 7499.00m, null, laptopsCategory, apple, 8, true, false, 4.9m, 92),

            CreateProduct("Bosch Serie 6 Washing Machine", "ბოში სერია 6 სარეცხი მანქანა",
                "9kg front-load washing machine with EcoSilence", "9კგ წინა ჩატვირთვის სარეცხი მანქანა EcoSilence-ით",
                "bosch-serie-6-washer", "WAU28PH9GB", 2899.00m, 3199.00m, kitchen, bosch, 7, true, false, 4.4m, 67),

            CreateProduct("Bosch Serie 4 Dishwasher", "ბოში სერია 4 ჭურჭლის სარეცხი",
                "Freestanding dishwasher with AquaStop", "თავისუფლად მდგომი ჭურჭლის სარეცხი AquaStop-ით",
                "bosch-serie-4-dishwasher", "SMS4HVW33E", 1999.00m, null, kitchen, bosch, 15, true, false, 4.3m, 34),

            CreateProduct("Bosch OptiMUM Food Processor", "ბოში ოპტიმუმ საკვების გადამამუშავებელი",
                "1600W food processor with 3D planetary mixing", "1600W საკვების გადამამუშავებელი 3D პლანეტარული შერევით",
                "bosch-optimum-food-processor", "MUM9BX5S61", 1599.00m, 1799.00m, kitchen, bosch, 20, true, true, 4.6m, 51),

            CreateProduct("Nike Air Max 270", "ნაიკი ეარ მაქს 270",
                "Men's running shoes with Max Air unit", "მამაკაცის სარბენი ფეხსაცმელი Max Air ერთეულით",
                "nike-air-max-270", "AH8050-002", 449.00m, 549.00m, sports, nike, 40, true, true, 4.5m, 213),

            CreateProduct("Nike Dri-FIT Training T-Shirt", "ნაიკი Dri-FIT სავარჯიშო მაისური",
                "Men's moisture-wicking training tee", "მამაკაცის ტენიანობის შემწოვი სავარჯიშო მაისური",
                "nike-dri-fit-tee", "AR6029-010", 129.00m, null, clothing, nike, 100, true, false, 4.3m, 87),

            CreateProduct("Nike Sportswear Club Hoodie", "ნაიკი სპორტსვეარ კლაბ ჰუდი",
                "Classic fleece pullover hoodie", "კლასიკური ფლისის პულოვერ ჰუდი",
                "nike-club-hoodie", "BV2654-010", 299.00m, 349.00m, clothing, nike, 60, true, false, 4.4m, 145),

            CreateProduct("Sony WH-1000XM5", "სონი WH-1000XM5",
                "Industry-leading noise cancelling headphones", "ინდუსტრიის წამყვანი ხმაურის მაცილებელი ყურსასმენი",
                "sony-wh-1000xm5", "WH1000XM5B", 999.00m, 1199.00m, audio, sony, 35, true, true, 4.8m, 342),

            CreateProduct("Sony WF-1000XM5", "სონი WF-1000XM5",
                "Premium true wireless noise cancelling earbuds", "პრემიუმ უსადენო ხმაურის მაცილებელი ყურსასმენი",
                "sony-wf-1000xm5", "WF1000XM5B", 799.00m, null, audio, sony, 28, true, true, 4.7m, 198),

            CreateProduct("Sony SRS-XB100", "სონი SRS-XB100",
                "Portable Bluetooth speaker with Extra Bass", "პორტატული Bluetooth დინამიკი Extra Bass-ით",
                "sony-srs-xb100", "SRSXB100B", 179.00m, 219.00m, audio, sony, 45, true, false, 4.2m, 76),

            CreateProduct("Samsung 65\" QLED 4K TV", "სამსუნგ 65\" QLED 4K ტელევიზორი",
                "Quantum Dot display with 4K resolution", "Quantum Dot ეკრანი 4K გარჩევადობით",
                "samsung-65-qled-4k", "QE65Q80C", 4499.00m, 4999.00m, audio, samsung, 6, true, true, 4.6m, 58),

            CreateProduct("Sony PlayStation 5", "სონი პლეისტეიშენ 5",
                "Next-gen gaming console with DualSense controller", "ახალი თაობის სათამაშო კონსოლი DualSense კონტროლერით",
                "playstation-5", "CFI-2016A", 1899.00m, null, audio, sony, 12, true, true, 4.9m, 427),

            CreateProduct("Samsung Galaxy Watch6 Classic", "სამსუნგ გალაქსი ვოჩ6 კლასიკი",
                "Premium smartwatch with rotating bezel", "პრემიუმ სმარტსაათი მბრუნავი ბეზელით",
                "galaxy-watch6-classic", "SM-L955F", 1099.00m, 1299.00m, phones, samsung, 18, true, false, 4.5m, 93),

            CreateProduct("Nike Air Force 1 '07", "ნაიკი ეარ ფორს 1 '07",
                "Iconic low-top sneaker in white leather", "ხატოვანი ქვედა სნიკერი თეთრ ტყავში",
                "nike-air-force-1-07", "CW2288-111", 399.00m, null, sports, nike, 55, true, true, 4.7m, 567),

            CreateProduct("Bosch Tassimo Coffee Machine", "ბოში ტასიმო ყავის მანქანა",
                "Single-serve coffee machine with T-disc technology", "ერთჯერადი ყავის მანქანა T-disc ტექნოლოგიით",
                "bosch-tassimo", "TAS6502GB", 499.00m, 599.00m, kitchen, bosch, 30, true, false, 4.1m, 112),
        ];
    }

    private static Product CreateProduct(
        string nameEn, string nameKa,
        string descEn, string descKa,
        string slug, string sku,
        decimal price, decimal? compareAtPrice,
        Category category, Brand brand,
        int stock, bool isActive, bool isFeatured,
        decimal rating, int reviewCount)
    {
        var product = new Product
        {
            Name = new LocalizedString(nameKa, nameEn),
            Description = new LocalizedString(descKa, descEn),
            Slug = slug,
            SKU = sku,
            Price = price,
            CompareAtPrice = compareAtPrice,
            CategoryId = category.Id,
            Category = category,
            BrandId = brand.Id,
            Brand = brand,
            StockQuantity = stock,
            IsActive = isActive,
            IsFeatured = isFeatured,
            Rating = rating,
            ReviewCount = reviewCount
        };

        product.Images.Add(new ProductImage
        {
            Url = $"https://placehold.co/600x600/E8E4F8/333333?text={Uri.EscapeDataString(nameEn)}",
            AltText = nameEn,
            SortOrder = 0,
            IsMain = true
        });

        return product;
    }
}
