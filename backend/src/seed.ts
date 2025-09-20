import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Standart' }
    }),
    prisma.category.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Lüks' }
    }),
    prisma.category.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Klasik' }
    })
  ]);

  console.log('✅ Categories created');

  // Create sample cars
  const cars = await Promise.all([
    prisma.car.upsert({
      where: { id: 1 },
      update: {},
      create: {
        make: 'BMW',
        model: 'X5',
        year: 2020,
        mileage: 45000,
        fuelType: 'Benzin',
        transmission: 'Otomatik',
        color: 'Beyaz',
        price: 25000,
        featured: true,
        categoryId: 2,
        images: {
          create: [
            { imagePath: '/cars/bmw-x5.jpg', isMain: true }
          ]
        },
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'BMW X5 2020',
              description: 'Lüks SUV, 2020 model BMW X5. Düşük kilometreli, tek elden, kazasız.',
              seoTitle: 'BMW X5 2020 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: '2020 model BMW X5 lüks SUV. Düşük kilometreli, kazasız araç.',
              seoKeywords: 'bmw,x5,2020,suv,lüks,araç'
            },
            {
              lang: 'en',
              title: 'BMW X5 2020',
              description: 'Luxury SUV, 2020 BMW X5 model. Low mileage, single owner, accident-free.',
              seoTitle: 'BMW X5 2020 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: '2020 BMW X5 luxury SUV. Low mileage, accident-free vehicle.',
              seoKeywords: 'bmw,x5,2020,suv,luxury,car'
            },
            {
              lang: 'ar',
              title: 'BMW X5 2020',
              description: 'سيارة دفع رباعي فاخرة، موديل BMW X5 2020. مسافة قليلة، مالك واحد، بدون حوادث.',
              seoTitle: 'BMW X5 2020 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'سيارة دفع رباعي فاخرة BMW X5 2020. مسافة قليلة، بدون حوادث.',
              seoKeywords: 'bmw,x5,2020,suv,فاخرة,سيارة'
            },
            {
              lang: 'ru',
              title: 'BMW X5 2020',
              description: 'Роскошный внедорожник, BMW X5 2020 года. Низкий пробег, один владелец, без аварий.',
              seoTitle: 'BMW X5 2020 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Роскошный внедорожник BMW X5 2020 года. Низкий пробег, без аварий.',
              seoKeywords: 'bmw,x5,2020,suv,роскошный,автомобиль'
            }
          ]
        }
      }
    }),
    prisma.car.upsert({
      where: { id: 2 },
      update: {},
      create: {
        make: 'Mercedes',
        model: 'SL500',
        year: 2019,
        mileage: 32000,
        fuelType: 'Benzin',
        transmission: 'Otomatik',
        color: 'Siyah',
        price: 35000,
        featured: true,
        categoryId: 2,
        images: {
          create: [
            { imagePath: '/cars/mercedes-sl500.jpg', isMain: true }
          ]
        },
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Mercedes SL500 2019',
              description: 'Spor araba, 2019 model Mercedes SL500. Düşük kilometreli, tek elden.',
              seoTitle: 'Mercedes SL500 2019 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: '2019 model Mercedes SL500 spor araba. Düşük kilometreli araç.',
              seoKeywords: 'mercedes,sl500,2019,spor,araç'
            },
            {
              lang: 'en',
              title: 'Mercedes SL500 2019',
              description: 'Sports car, 2019 Mercedes SL500 model. Low mileage, single owner.',
              seoTitle: 'Mercedes SL500 2019 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: '2019 Mercedes SL500 sports car. Low mileage vehicle.',
              seoKeywords: 'mercedes,sl500,2019,sports,car'
            },
            {
              lang: 'ar',
              title: 'Mercedes SL500 2019',
              description: 'سيارة رياضية، موديل Mercedes SL500 2019. مسافة قليلة، مالك واحد.',
              seoTitle: 'Mercedes SL500 2019 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'سيارة رياضية Mercedes SL500 2019. مسافة قليلة.',
              seoKeywords: 'mercedes,sl500,2019,رياضية,سيارة'
            },
            {
              lang: 'ru',
              title: 'Mercedes SL500 2019',
              description: 'Спортивный автомобиль, Mercedes SL500 2019 года. Низкий пробег, один владелец.',
              seoTitle: 'Mercedes SL500 2019 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Спортивный автомобиль Mercedes SL500 2019 года. Низкий пробег.',
              seoKeywords: 'mercedes,sl500,2019,спортивный,автомобиль'
            }
          ]
        }
      }
    }),
    prisma.car.upsert({
      where: { id: 3 },
      update: {},
      create: {
        make: 'Toyota',
        model: 'Corolla',
        year: 2021,
        mileage: 25000,
        fuelType: 'Benzin',
        transmission: 'Manuel',
        color: 'Gri',
        price: 15000,
        featured: false,
        categoryId: 1,
        images: {
          create: [
            { imagePath: '/cars/toyota-corolla.jpg', isMain: true }
          ]
        },
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Toyota Corolla 2021',
              description: 'Güvenilir sedan, 2021 model Toyota Corolla. Düşük kilometreli, ekonomik.',
              seoTitle: 'Toyota Corolla 2021 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: '2021 model Toyota Corolla güvenilir sedan. Düşük kilometreli, ekonomik araç.',
              seoKeywords: 'toyota,corolla,2021,sedan,ekonomik'
            },
            {
              lang: 'en',
              title: 'Toyota Corolla 2021',
              description: 'Reliable sedan, 2021 Toyota Corolla model. Low mileage, economical.',
              seoTitle: 'Toyota Corolla 2021 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: '2021 Toyota Corolla reliable sedan. Low mileage, economical vehicle.',
              seoKeywords: 'toyota,corolla,2021,sedan,economical'
            },
            {
              lang: 'ar',
              title: 'Toyota Corolla 2021',
              description: 'سيارة سيدان موثوقة، موديل Toyota Corolla 2021. مسافة قليلة، اقتصادية.',
              seoTitle: 'Toyota Corolla 2021 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'سيارة سيدان موثوقة Toyota Corolla 2021. مسافة قليلة، اقتصادية.',
              seoKeywords: 'toyota,corolla,2021,sedan,اقتصادية'
            },
            {
              lang: 'ru',
              title: 'Toyota Corolla 2021',
              description: 'Надежный седан, Toyota Corolla 2021 года. Низкий пробег, экономичный.',
              seoTitle: 'Toyota Corolla 2021 - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Надежный седан Toyota Corolla 2021 года. Низкий пробег, экономичный.',
              seoKeywords: 'toyota,corolla,2021,седан,экономичный'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Cars created');

  // Create sample blog posts
  const blogPosts = await Promise.all([
    prisma.blogPost.upsert({
      where: { id: 1 },
      update: {},
      create: {
        slug: 'ikinci-el-araba-alirken-dikkat-edilecekler',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'İkinci El Araba Alırken Dikkat Edilecekler',
              content: 'İkinci el araba alırken dikkat edilmesi gereken önemli noktalar vardır. Öncelikle aracın geçmişini araştırmak, kaza geçmişi olup olmadığını öğrenmek çok önemlidir. Ayrıca motor durumu, fren sistemi, lastikler ve genel bakım durumu kontrol edilmelidir.',
              seoTitle: 'İkinci El Araba Alırken Dikkat Edilecekler - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'İkinci el araba alırken dikkat edilmesi gereken önemli noktalar ve ipuçları.',
              seoKeywords: 'ikinci el araba,araç alımı,tavsiyeler,dikkat edilecekler'
            },
            {
              lang: 'en',
              title: 'Things to Consider When Buying a Used Car',
              content: 'There are important points to consider when buying a used car. First of all, it is very important to research the history of the vehicle and find out if it has been in an accident. In addition, the engine condition, brake system, tires and general maintenance condition should be checked.',
              seoTitle: 'Things to Consider When Buying a Used Car - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Important points and tips to consider when buying a used car.',
              seoKeywords: 'used car,car buying,tips,considerations'
            },
            {
              lang: 'ar',
              title: 'نقاط مهمة عند شراء سيارة مستعملة',
              content: 'هناك نقاط مهمة يجب مراعاتها عند شراء سيارة مستعملة. أولاً، من المهم جداً البحث عن تاريخ السيارة ومعرفة ما إذا كانت قد تعرضت لحادث. بالإضافة إلى ذلك، يجب فحص حالة المحرك ونظام الفرامل والإطارات والحالة العامة للصيانة.',
              seoTitle: 'نقاط مهمة عند شراء سيارة مستعملة - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'نقاط مهمة ونصائح يجب مراعاتها عند شراء سيارة مستعملة.',
              seoKeywords: 'سيارة مستعملة,شراء سيارة,نصائح,نقاط مهمة'
            },
            {
              lang: 'ru',
              title: 'На что обратить внимание при покупке подержанного автомобиля',
              content: 'При покупке подержанного автомобиля есть важные моменты, на которые следует обратить внимание. В первую очередь очень важно исследовать историю автомобиля и выяснить, был ли он в аварии. Кроме того, следует проверить состояние двигателя, тормозной системы, шин и общее состояние обслуживания.',
              seoTitle: 'На что обратить внимание при покупке подержанного автомобиля - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Важные моменты и советы, на которые следует обратить внимание при покупке подержанного автомобиля.',
              seoKeywords: 'подержанный автомобиль,покупка автомобиля,советы,внимание'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Blog posts created');

  // Create sample pages
  const pages = await Promise.all([
    prisma.page.upsert({
      where: { id: 1 },
      update: {},
      create: {
        slug: 'hakkimizda',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Hakkımızda',
              content: 'Mustafa Cangil Auto Trading Ltd. olarak 20 yılı aşkın süredir KKTC\'de güvenilir araç ticareti yapmaktayız. Müşteri memnuniyeti odaklı hizmet anlayışımızla, kaliteli ve güvenilir araçları sizlere sunmaya devam ediyoruz.',
              seoTitle: 'Hakkımızda - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. hakkında bilgi alın. 20 yıllık deneyimimizle güvenilir araç ticareti.',
              seoKeywords: 'hakkımızda,mustafa cangil motors,galeri,deneyim'
            },
            {
              lang: 'en',
              title: 'About Us',
              content: 'As Mustafa Cangil Auto Trading Ltd., we have been doing reliable vehicle trade in Northern Cyprus for over 20 years. With our customer satisfaction-oriented service approach, we continue to offer you quality and reliable vehicles.',
              seoTitle: 'About Us - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Learn about Mustafa Cangil Auto Trading Ltd.. Reliable vehicle trade with our 20 years of experience.',
              seoKeywords: 'about us,mustafa cangil motors,gallery,experience'
            },
            {
              lang: 'ar',
              title: 'من نحن',
              content: 'نحن في مصطفى جانجيل موتورز نقوم بتجارة السيارات الموثوقة في شمال قبرص لأكثر من 20 عاماً. مع نهج خدمتنا الموجه نحو رضا العملاء، نواصل تقديم سيارات عالية الجودة وموثوقة لكم.',
              seoTitle: 'من نحن - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'تعرف على مصطفى جانجيل موتورز. تجارة سيارات موثوقة مع 20 عاماً من الخبرة.',
              seoKeywords: 'من نحن,مصطفى جانجيل موتورز,معرض,خبرة'
            },
            {
              lang: 'ru',
              title: 'О нас',
              content: 'Как Mustafa Cangil Auto Trading Ltd., мы занимаемся надежной торговлей автомобилями в Северном Кипре уже более 20 лет. С нашим подходом к обслуживанию, ориентированным на удовлетворение клиентов, мы продолжаем предлагать вам качественные и надежные автомобили.',
              seoTitle: 'О нас - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Узнайте о Mustafa Cangil Auto Trading Ltd.. Надежная торговля автомобилями с нашим 20-летним опытом.',
              seoKeywords: 'о нас,mustafa cangil motors,галерея,опыт'
            }
          ]
        }
      }
    }),
    prisma.page.upsert({
      where: { id: 2 },
      update: {},
      create: {
        slug: 'iletisim',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'İletişim',
              content: 'Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz. Müşteri hizmetlerimiz 7/24 hizmetinizdedir.',
              seoTitle: 'İletişim - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. iletişim bilgileri. 7/24 müşteri hizmetleri.',
              seoKeywords: 'iletişim,mustafa cangil motors,adres,telefon'
            },
            {
              lang: 'en',
              title: 'Contact',
              content: 'You can use the information below to contact us. Our customer services are at your service 24/7.',
              seoTitle: 'Contact - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. contact information. 24/7 customer services.',
              seoKeywords: 'contact,mustafa cangil motors,address,phone'
            },
            {
              lang: 'ar',
              title: 'اتصل بنا',
              content: 'يمكنك استخدام المعلومات أدناه للتواصل معنا. خدمات العملاء لدينا في خدمتكم على مدار الساعة.',
              seoTitle: 'اتصل بنا - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'معلومات الاتصال بمصطفى جانجيل موتورز. خدمات عملاء على مدار الساعة.',
              seoKeywords: 'اتصل بنا,مصطفى جانجيل موتورز,عنوان,هاتف'
            },
            {
              lang: 'ru',
              title: 'Контакты',
              content: 'Вы можете использовать информацию ниже, чтобы связаться с нами. Наши службы поддержки клиентов работают круглосуточно.',
              seoTitle: 'Контакты - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Контактная информация Mustafa Cangil Auto Trading Ltd.. Круглосуточные службы поддержки клиентов.',
              seoKeywords: 'контакты,mustafa cangil motors,адрес,телефон'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ Pages created');

  // Create settings
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      instagram: 'https://www.instagram.com/mcangilmotors',
      facebook: 'https://www.facebook.com/mustafacangilmotors/?locale=tr_TR',
      whatsapp: '+905338551166',
      phone: '+90 533 855 11 66'
    }
  });

  console.log('✅ Settings created');

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        fullName: 'Ahmet Yılmaz',
        phone: '+90 533 123 45 67',
        email: 'ahmet@example.com'
      }
    }),
    prisma.customer.create({
      data: {
        fullName: 'Mehmet Demir',
        phone: '+90 533 234 56 78',
        email: 'mehmet@example.com'
      }
    }),
    prisma.customer.create({
      data: {
        fullName: 'Ayşe Kaya',
        phone: '+90 533 345 67 89',
        email: 'ayse@example.com'
      }
    })
  ]);

  console.log('✅ Customers created');

  // Create sample offers
  await Promise.all([
    prisma.offer.create({
      data: {
        carId: 1,
        customerId: customers[0].id,
        message: 'Bu araç hakkında detaylı bilgi almak istiyorum. Fiyat konusunda pazarlık yapılabilir mi?',
        status: 'pending'
      }
    }),
    prisma.offer.create({
      data: {
        carId: 2,
        customerId: customers[1].id,
        message: 'Merhaba, Mercedes SL500 modelini görmek istiyorum. Test sürüşü yapabilir miyim?',
        status: 'contacted'
      }
    }),
    prisma.offer.create({
      data: {
        carId: 1,
        customerId: customers[2].id,
        message: 'BMW X5 için teklifim var. 25.000 £ ödeyebilirim.',
        status: 'closed'
      }
    })
  ]);

  console.log('✅ Offers created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });







