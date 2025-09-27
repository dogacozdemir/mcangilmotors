import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Standart' }
    }),
    prisma.category.create({
      data: { name: 'Lüks' }
    }),
    prisma.category.create({
      data: { name: 'Klasik' }
    })
  ]);

  console.log('✅ Categories created');

  // Create sample cars - 8 cars total
  const cars = await Promise.all([
    // Standart kategorisi - 3 araç
    prisma.car.create({
      data: {
        categoryId: categories[0].id, // Standart
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        mileage: 15000,
        fuelType: 'Hybrid',
        transmission: 'CVT',
        color: 'Beyaz',
        engine: '1.8L Hybrid',
        bodyType: 'Sedan',
        plateStatus: 'plakalı',
        price: 850000,
        featured: true
      }
    }),
    prisma.car.create({
      data: {
        categoryId: categories[0].id, // Standart
        make: 'Volkswagen',
        model: 'Golf',
        year: 2021,
        mileage: 25000,
        fuelType: 'Benzin',
        transmission: 'Manuel',
        color: 'Gri',
        engine: '1.5L TSI',
        bodyType: 'Hatchback',
        plateStatus: 'plakalı',
        price: 750000,
        featured: false
      }
    }),
    prisma.car.create({
      data: {
        categoryId: categories[0].id, // Standart
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        mileage: 35000,
        fuelType: 'Benzin',
        transmission: 'CVT',
        color: 'Mavi',
        engine: '1.6L i-VTEC',
        bodyType: 'Sedan',
        plateStatus: 'plakasız',
        price: 680000,
        featured: true
      }
    }),
    
    // Lüks kategorisi - 3 araç
    prisma.car.create({
      data: {
        categoryId: categories[1].id, // Lüks
        make: 'BMW',
        model: 'X5',
        year: 2023,
        mileage: 8000,
        fuelType: 'Benzin',
        transmission: 'Otomatik',
        color: 'Siyah',
        engine: '3.0L TwinPower Turbo',
        bodyType: 'SUV',
        plateStatus: 'plakalı',
        price: 2500000,
        featured: true
      }
    }),
    prisma.car.create({
      data: {
        categoryId: categories[1].id, // Lüks
        make: 'Audi',
        model: 'A4',
        year: 2023,
        mileage: 12000,
        fuelType: 'Benzin',
        transmission: 'Otomatik',
        color: 'Gümüş',
        engine: '2.0L TFSI',
        bodyType: 'Sedan',
        plateStatus: 'plakalı',
        price: 1800000,
        featured: true
      }
    }),
    prisma.car.create({
      data: {
        categoryId: categories[1].id, // Lüks
        make: 'Mercedes-Benz',
        model: 'C-Class',
        year: 2022,
        mileage: 20000,
        fuelType: 'Benzin',
        transmission: 'Otomatik',
        color: 'Siyah',
        engine: '2.0L Turbo',
        bodyType: 'Sedan',
        plateStatus: 'plakalı',
        price: 2200000,
        featured: false
      }
    }),
    
    // Klasik kategorisi - 2 araç
    prisma.car.create({
      data: {
        categoryId: categories[2].id, // Klasik
        make: 'Mercedes-Benz',
        model: 'SL 500',
        year: 1995,
        mileage: 120000,
        fuelType: 'Benzin',
        transmission: 'Otomatik',
        color: 'Kırmızı',
        engine: '5.0L V8',
        bodyType: 'Cabrio',
        plateStatus: 'plakasız',
        price: 1800000,
        featured: false
      }
    }),
    prisma.car.create({
      data: {
        categoryId: categories[2].id, // Klasik
        make: 'Ford',
        model: 'Mustang',
        year: 1985,
        mileage: 95000,
        fuelType: 'Benzin',
        transmission: 'Manuel',
        color: 'Kırmızı',
        engine: '5.0L V8',
        bodyType: 'Coupe',
        plateStatus: 'plakalı',
        price: 1500000,
        featured: true
      }
    })
  ]);

  console.log('✅ Cars created');

  // Create car translations
  const carTranslations = [];
  for (const car of cars) {
    // Turkish translations
    carTranslations.push(
      prisma.carTranslation.create({
        data: {
          carId: car.id,
          lang: 'tr',
          title: `${car.make} ${car.model} ${car.year}`,
          description: `${car.year} model ${car.make} ${car.model}. ${car.mileage} km'de, ${car.fuelType} yakıt tüketimi, ${car.transmission} şanzıman.`,
          seoTitle: `${car.make} ${car.model} ${car.year} - Mustafa Cangil Auto Trading Ltd.`,
          seoDescription: `${car.year} model ${car.make} ${car.model} satılık. Detaylı bilgi için iletişime geçin.`,
          seoKeywords: `${car.make}, ${car.model}, ${car.year}, ikinci el, satılık, KKTC`
        }
      })
    );

    // English translations
    carTranslations.push(
      prisma.carTranslation.create({
        data: {
          carId: car.id,
          lang: 'en',
          title: `${car.make} ${car.model} ${car.year}`,
          description: `${car.year} ${car.make} ${car.model}. ${car.mileage} km mileage, ${car.fuelType} fuel, ${car.transmission} transmission.`,
          seoTitle: `${car.make} ${car.model} ${car.year} - Mustafa Cangil Auto Trading Ltd.`,
          seoDescription: `${car.year} ${car.make} ${car.model} for sale. Contact us for more information.`,
          seoKeywords: `${car.make}, ${car.model}, ${car.year}, used car, for sale, Northern Cyprus`
        }
      })
    );

    // Arabic translations
    carTranslations.push(
      prisma.carTranslation.create({
        data: {
          carId: car.id,
          lang: 'ar',
          title: `${car.make} ${car.model} ${car.year}`,
          description: `${car.year} ${car.make} ${car.model}. ${car.mileage} كم، وقود ${car.fuelType}، ناقل حركة ${car.transmission}.`,
          seoTitle: `${car.make} ${car.model} ${car.year} - مصطفى جانجيل موتورز`,
          seoDescription: `${car.year} ${car.make} ${car.model} للبيع. اتصل بنا لمزيد من المعلومات.`,
          seoKeywords: `${car.make}, ${car.model}, ${car.year}, سيارة مستعملة, للبيع, شمال قبرص`
        }
      })
    );

    // Russian translations
    carTranslations.push(
      prisma.carTranslation.create({
        data: {
          carId: car.id,
          lang: 'ru',
          title: `${car.make} ${car.model} ${car.year}`,
          description: `${car.year} ${car.make} ${car.model}. ${car.mileage} км пробега, ${car.fuelType} топливо, ${car.transmission} коробка передач.`,
          seoTitle: `${car.make} ${car.model} ${car.year} - Мустафа Джангил Моторс`,
          seoDescription: `${car.year} ${car.make} ${car.model} в продаже. Свяжитесь с нами для получения дополнительной информации.`,
          seoKeywords: `${car.make}, ${car.model}, ${car.year}, подержанный автомобиль, в продаже, Северный Кипр`
        }
      })
    );
  }

  await Promise.all(carTranslations);
  console.log('✅ Car translations created');

  // Create sample blog posts - 2 posts total
  const blogPosts = await Promise.all([
    prisma.blogPost.upsert({
      where: { id: 1 },
      update: {},
      create: {
        slug: 'ikinci-el-araba-alirken-dikkat-edilmesi-gerekenler'
      }
    }),
    prisma.blogPost.upsert({
      where: { id: 2 },
      update: {},
      create: {
        slug: 'araba-bakimi-ve-servis-onerileri'
      }
    })
  ]);

  // Create blog translations
  const blogTranslations = [];
  for (const post of blogPosts) {
    // Turkish translations
    blogTranslations.push(
      prisma.blogTranslation.upsert({
        where: { 
          postId_lang: { 
            postId: post.id, 
            lang: 'tr' 
          } 
        },
        update: {},
        create: {
          postId: post.id,
          lang: 'tr',
          title: getBlogTitle(post.slug, 'tr'),
          content: getBlogContent(post.slug, 'tr'),
          seoTitle: getBlogSeoTitle(post.slug, 'tr'),
          seoDescription: getBlogSeoDescription(post.slug, 'tr'),
          seoKeywords: getBlogSeoKeywords(post.slug, 'tr')
        }
      })
    );

    // English translations
    blogTranslations.push(
      prisma.blogTranslation.upsert({
        where: { 
          postId_lang: { 
            postId: post.id, 
            lang: 'en' 
          } 
        },
        update: {},
        create: {
          postId: post.id,
          lang: 'en',
          title: getBlogTitle(post.slug, 'en'),
          content: getBlogContent(post.slug, 'en'),
          seoTitle: getBlogSeoTitle(post.slug, 'en'),
          seoDescription: getBlogSeoDescription(post.slug, 'en'),
          seoKeywords: getBlogSeoKeywords(post.slug, 'en')
        }
      })
    );

    // Arabic translations
    blogTranslations.push(
      prisma.blogTranslation.upsert({
        where: { 
          postId_lang: { 
            postId: post.id, 
            lang: 'ar' 
          } 
        },
        update: {},
        create: {
          postId: post.id,
          lang: 'ar',
          title: getBlogTitle(post.slug, 'ar'),
          content: getBlogContent(post.slug, 'ar'),
          seoTitle: getBlogSeoTitle(post.slug, 'ar'),
          seoDescription: getBlogSeoDescription(post.slug, 'ar'),
          seoKeywords: getBlogSeoKeywords(post.slug, 'ar')
        }
      })
    );

    // Russian translations
    blogTranslations.push(
      prisma.blogTranslation.upsert({
        where: { 
          postId_lang: { 
            postId: post.id, 
            lang: 'ru' 
          } 
        },
        update: {},
        create: {
          postId: post.id,
          lang: 'ru',
          title: getBlogTitle(post.slug, 'ru'),
          content: getBlogContent(post.slug, 'ru'),
          seoTitle: getBlogSeoTitle(post.slug, 'ru'),
          seoDescription: getBlogSeoDescription(post.slug, 'ru'),
          seoKeywords: getBlogSeoKeywords(post.slug, 'ru')
        }
      })
    );
  }

  // Helper functions for blog content
  function getBlogTitle(slug: string, lang: string): string {
    const titles: Record<string, Record<string, string>> = {
      'ikinci-el-araba-alirken-dikkat-edilmesi-gerekenler': {
        tr: 'İkinci El Araba Alırken Dikkat Edilmesi Gerekenler',
        en: 'Things to Consider When Buying a Used Car',
        ar: 'أشياء يجب مراعاتها عند شراء سيارة مستعملة',
        ru: 'На что обратить внимание при покупке подержанного автомобиля'
      },
      'araba-bakimi-ve-servis-onerileri': {
        tr: 'Araba Bakımı ve Servis Önerileri',
        en: 'Car Maintenance and Service Recommendations',
        ar: 'نصائح صيانة السيارات والخدمات',
        ru: 'Рекомендации по обслуживанию и ремонту автомобилей'
      }
    };
    return titles[slug]?.[lang] || titles[slug]?.['tr'] || 'Blog Post';
  }

  function getBlogContent(slug: string, lang: string): string {
    const contents: Record<string, Record<string, string>> = {
      'ikinci-el-araba-alirken-dikkat-edilmesi-gerekenler': {
        tr: 'İkinci el araba alırken dikkat edilmesi gereken önemli noktalar vardır. Öncelikle aracın geçmişini araştırmak, teknik kontrol yaptırmak ve fiyat karşılaştırması yapmak gerekir. Ayrıca aracın bakım geçmişi, kaza durumu ve kilometre bilgileri de önemlidir. Bu rehberde, güvenli bir satın alma işlemi için dikkat edilmesi gereken tüm detayları bulabilirsiniz.',
        en: 'There are important points to consider when buying a used car. First, research the vehicle\'s history, have a technical inspection, and compare prices. Also, the vehicle\'s maintenance history, accident status, and mileage information are important. In this guide, you can find all the details you need to pay attention to for a safe purchase.',
        ar: 'هناك نقاط مهمة يجب مراعاتها عند شراء سيارة مستعملة. أولاً، ابحث عن تاريخ المركبة، وقم بفحص فني، وقارن الأسعار. كما أن تاريخ الصيانة وحالة الحوادث ومعلومات المسافة المقطوعة مهمة. في هذا الدليل، يمكنك العثور على جميع التفاصيل التي تحتاج إلى الانتباه إليها لشراء آمن.',
        ru: 'При покупке подержанного автомобиля есть важные моменты, на которые стоит обратить внимание. Сначала изучите историю автомобиля, проведите технический осмотр и сравните цены. Также важны история обслуживания, аварийность и пробег. В этом руководстве вы найдете все детали, на которые нужно обратить внимание для безопасной покупки.'
      },
      'araba-bakimi-ve-servis-onerileri': {
        tr: 'Arabanızın bakımı için önemli ipuçları ve servis önerileri. Düzenli yağ değişimi, lastik kontrolü, fren sistemi bakımı ve motor temizliği gibi konularda dikkatli olmak gerekir. Ayrıca mevsimsel bakım, filtre değişimleri ve genel araç sağlığı konularında da bilgi sahibi olmak önemlidir.',
        en: 'Important tips for car maintenance and service recommendations. You need to be careful about regular oil changes, tire checks, brake system maintenance, and engine cleaning. It is also important to have knowledge about seasonal maintenance, filter changes, and general vehicle health.',
        ar: 'نصائح مهمة لصيانة السيارة وتوصيات الخدمة. تحتاج إلى توخي الحذر بشأن تغيير الزيت المنتظم وفحص الإطارات وصيانة نظام الفرامل وتنظيف المحرك. من المهم أيضاً أن تكون لديك معرفة حول الصيانة الموسمية وتغيير المرشحات والصحة العامة للمركبة.',
        ru: 'Важные советы по обслуживанию автомобиля и рекомендации по сервису. Нужно быть внимательным к регулярной замене масла, проверке шин, обслуживанию тормозной системы и очистке двигателя. Также важно иметь знания о сезонном обслуживании, замене фильтров и общем состоянии автомобиля.'
      }
    };
    return contents[slug]?.[lang] || contents[slug]?.['tr'] || 'Blog content...';
  }

  function getBlogSeoTitle(slug: string, lang: string): string {
    return `${getBlogTitle(slug, lang)} - Mustafa Cangil Auto Trading Ltd.`;
  }

  function getBlogSeoDescription(slug: string, lang: string): string {
    const descriptions: Record<string, Record<string, string>> = {
      'ikinci-el-araba-alirken-dikkat-edilmesi-gerekenler': {
        tr: 'İkinci el araba alırken dikkat edilmesi gereken önemli noktalar ve öneriler. Güvenli satın alma için rehber.',
        en: 'Important points and recommendations when buying a used car. Guide for safe purchasing.',
        ar: 'نقاط مهمة وتوصيات عند شراء سيارة مستعملة. دليل للشراء الآمن.',
        ru: 'Важные моменты и рекомендации при покупке подержанного автомобиля. Руководство по безопасной покупке.'
      },
      'araba-bakimi-ve-servis-onerileri': {
        tr: 'Arabanızın bakımı için önemli ipuçları ve servis önerileri. Araç sağlığı için rehber.',
        en: 'Important tips for car maintenance and service recommendations. Guide for vehicle health.',
        ar: 'نصائح مهمة لصيانة السيارة وتوصيات الخدمة. دليل لصحة المركبة.',
        ru: 'Важные советы по обслуживанию автомобиля и рекомендации по сервису. Руководство по здоровью автомобиля.'
      }
    };
    return descriptions[slug]?.[lang] || descriptions[slug]?.['tr'] || 'Blog description...';
  }

  function getBlogSeoKeywords(slug: string, lang: string): string {
    const keywords: Record<string, Record<string, string>> = {
      'ikinci-el-araba-alirken-dikkat-edilmesi-gerekenler': {
        tr: 'ikinci el araba, araba alırken dikkat, araba satın alma, KKTC, güvenli satın alma',
        en: 'used car, car buying tips, car purchase, Northern Cyprus, safe buying',
        ar: 'سيارة مستعملة, نصائح شراء السيارة, شراء سيارة, شمال قبرص, شراء آمن',
        ru: 'подержанный автомобиль, советы по покупке, покупка автомобиля, Северный Кипр, безопасная покупка'
      },
      'araba-bakimi-ve-servis-onerileri': {
        tr: 'araba bakımı, servis, araba bakım ipuçları, KKTC, araç sağlığı',
        en: 'car maintenance, service, car care tips, Northern Cyprus, vehicle health',
        ar: 'صيانة السيارة, خدمة, نصائح العناية بالسيارة, شمال قبرص, صحة المركبة',
        ru: 'обслуживание автомобиля, сервис, советы по уходу, Северный Кипр, здоровье автомобиля'
      }
    };
    return keywords[slug]?.[lang] || keywords[slug]?.['tr'] || 'blog, mustafa cangil motors';
  }

  await Promise.all(blogTranslations);
  console.log('✅ Blog posts and translations created');

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

  // Create about page sections
  const aboutSections = await Promise.all([
    prisma.page.upsert({
      where: { id: 3 },
      update: {},
      create: {
        slug: 'about-mission',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Misyonumuz',
              content: 'Müşteri memnuniyetini ön planda tutarak, kaliteli ve güvenilir araçları uygun fiyatlarla sunmak. Her müşterimizin ihtiyacına uygun çözümler üretmek ve sektörde öncü olmak.',
              seoTitle: 'Misyonumuz - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. misyonu ve değerleri.',
              seoKeywords: 'misyon,mustafa cangil motors,değerler'
            },
            {
              lang: 'en',
              title: 'Our Mission',
              content: 'To prioritize customer satisfaction by offering quality and reliable vehicles at reasonable prices. To produce solutions suitable for each customer\'s needs and to be a pioneer in the sector.',
              seoTitle: 'Our Mission - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. mission and values.',
              seoKeywords: 'mission,mustafa cangil motors,values'
            },
            {
              lang: 'ar',
              title: 'مهمتنا',
              content: 'نحن نعطي الأولوية لرضا العملاء من خلال تقديم سيارات عالية الجودة وموثوقة بأسعار معقولة. إنتاج حلول مناسبة لاحتياجات كل عميل والريادة في القطاع.',
              seoTitle: 'مهمتنا - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'مهمة وقيم مصطفى جانجيل موتورز.',
              seoKeywords: 'مهمة,مصطفى جانجيل موتورز,قيم'
            },
            {
              lang: 'ru',
              title: 'Наша миссия',
              content: 'Ставить удовлетворение клиентов на первое место, предлагая качественные и надежные автомобили по разумным ценам. Создавать решения, подходящие для потребностей каждого клиента, и быть пионером в отрасли.',
              seoTitle: 'Наша миссия - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Миссия и ценности Mustafa Cangil Auto Trading Ltd..',
              seoKeywords: 'миссия,mustafa cangil motors,ценности'
            }
          ]
        }
      }
    }),
    prisma.page.upsert({
      where: { id: 4 },
      update: {},
      create: {
        slug: 'about-vision',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Vizyonumuz',
              content: 'KKTC\'nin en güvenilir ve tercih edilen araç galerisi olmak. Müşteri memnuniyetinde sektörde öncü konumda olmak ve sürekli gelişim göstermek.',
              seoTitle: 'Vizyonumuz - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. vizyonu ve gelecek hedefleri.',
              seoKeywords: 'vizyon,mustafa cangil motors,hedefler'
            },
            {
              lang: 'en',
              title: 'Our Vision',
              content: 'To be the most reliable and preferred vehicle gallery in Northern Cyprus. To be a pioneer in customer satisfaction in the sector and to show continuous development.',
              seoTitle: 'Our Vision - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. vision and future goals.',
              seoKeywords: 'vision,mustafa cangil motors,goals'
            },
            {
              lang: 'ar',
              title: 'رؤيتنا',
              content: 'أن نكون معرض السيارات الأكثر موثوقية ومفضلاً في شمال قبرص. أن نكون رواداً في رضا العملاء في القطاع ونظهر تطوراً مستمراً.',
              seoTitle: 'رؤيتنا - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'رؤية وأهداف مستقبلية لمصطفى جانجيل موتورز.',
              seoKeywords: 'رؤية,مصطفى جانجيل موتورز,أهداف'
            },
            {
              lang: 'ru',
              title: 'Наше видение',
              content: 'Быть самой надежной и предпочтительной автомобильной галереей в Северном Кипре. Быть пионером в удовлетворении клиентов в отрасли и показывать постоянное развитие.',
              seoTitle: 'Наше видение - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Видение и будущие цели Mustafa Cangil Auto Trading Ltd..',
              seoKeywords: 'видение,mustafa cangil motors,цели'
            }
          ]
        }
      }
    }),
    prisma.page.upsert({
      where: { id: 5 },
      update: {},
      create: {
        slug: 'about-values',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Değerlerimiz',
              content: 'Güven, kalite, müşteri memnuniyeti ve profesyonellik değerlerimizle hizmet veriyoruz. Her işlemimizde şeffaflık ve dürüstlük ilkelerimizi koruyoruz.',
              seoTitle: 'Değerlerimiz - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. değerleri ve ilkeleri.',
              seoKeywords: 'değerler,mustafa cangil motors,ilkeler'
            },
            {
              lang: 'en',
              title: 'Our Values',
              content: 'We serve with our values of trust, quality, customer satisfaction and professionalism. We maintain our principles of transparency and honesty in every transaction.',
              seoTitle: 'Our Values - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. values and principles.',
              seoKeywords: 'values,mustafa cangil motors,principles'
            },
            {
              lang: 'ar',
              title: 'قيمنا',
              content: 'نحن نخدم بقيمنا من الثقة والجودة ورضا العملاء والمهنية. نحافظ على مبادئ الشفافية والصدق في كل معاملة.',
              seoTitle: 'قيمنا - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'قيم ومبادئ مصطفى جانجيل موتورز.',
              seoKeywords: 'قيم,مصطفى جانجيل موتورز,مبادئ'
            },
            {
              lang: 'ru',
              title: 'Наши ценности',
              content: 'Мы служим нашими ценностями доверия, качества, удовлетворения клиентов и профессионализма. Мы поддерживаем наши принципы прозрачности и честности в каждой сделке.',
              seoTitle: 'Наши ценности - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Ценности и принципы Mustafa Cangil Auto Trading Ltd..',
              seoKeywords: 'ценности,mustafa cangil motors,принципы'
            }
          ]
        }
      }
    }),
    prisma.page.upsert({
      where: { id: 6 },
      update: {},
      create: {
        slug: 'about-experience',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Deneyimimiz',
              content: '25 yılı aşkın süredir sektörde faaliyet gösteriyoruz. Bu süre zarfında binlerce müşteriye hizmet verdik ve sektörde güvenilir bir isim haline geldik.',
              seoTitle: 'Deneyimimiz - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. deneyimi ve geçmişi.',
              seoKeywords: 'deneyim,mustafa cangil motors,geçmiş'
            },
            {
              lang: 'en',
              title: 'Our Experience',
              content: 'We have been operating in the sector for over 25 years. During this time, we have served thousands of customers and become a trusted name in the sector.',
              seoTitle: 'Our Experience - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. experience and history.',
              seoKeywords: 'experience,mustafa cangil motors,history'
            },
            {
              lang: 'ar',
              title: 'خبرتنا',
              content: 'نحن نعمل في القطاع لأكثر من 25 عاماً. خلال هذه الفترة، خدمنا آلاف العملاء وأصبحنا اسماً موثوقاً في القطاع.',
              seoTitle: 'خبرتنا - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'خبرة وتاريخ مصطفى جانجيل موتورز.',
              seoKeywords: 'خبرة,مصطفى جانجيل موتورز,تاريخ'
            },
            {
              lang: 'ru',
              title: 'Наш опыт',
              content: 'Мы работаем в отрасли уже более 25 лет. За это время мы обслужили тысячи клиентов и стали надежным именем в отрасли.',
              seoTitle: 'Наш опыт - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Опыт и история Mustafa Cangil Auto Trading Ltd..',
              seoKeywords: 'опыт,mustafa cangil motors,история'
            }
          ]
        }
      }
    }),
    prisma.page.upsert({
      where: { id: 7 },
      update: {},
      create: {
        slug: 'about-service-area',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Hizmet Alanımız',
              content: 'KKTC genelinde hizmet veriyoruz. Lefkoşa merkez ofisimiz ve Girne şubemizle müşterilerimize yakın hizmet sunuyoruz.',
              seoTitle: 'Hizmet Alanımız - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. hizmet alanları ve lokasyonlar.',
              seoKeywords: 'hizmet alanı,mustafa cangil motors,lokasyon'
            },
            {
              lang: 'en',
              title: 'Our Service Area',
              content: 'We serve throughout Northern Cyprus. We provide close service to our customers with our central office in Nicosia and our branch in Kyrenia.',
              seoTitle: 'Our Service Area - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. service areas and locations.',
              seoKeywords: 'service area,mustafa cangil motors,locations'
            },
            {
              lang: 'ar',
              title: 'منطقة خدمتنا',
              content: 'نحن نخدم في جميع أنحاء شمال قبرص. نقدم خدمة قريبة لعملائنا مع مكتبنا المركزي في نيقوسيا وفرعنا في كيرينيا.',
              seoTitle: 'منطقة خدمتنا - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'مناطق خدمة ومواقع مصطفى جانجيل موتورز.',
              seoKeywords: 'منطقة خدمة,مصطفى جانجيل موتورز,مواقع'
            },
            {
              lang: 'ru',
              title: 'Наша зона обслуживания',
              content: 'Мы обслуживаем по всему Северному Кипру. Мы предоставляем близкое обслуживание нашим клиентам с нашим центральным офисом в Никосии и нашим филиалом в Кирении.',
              seoTitle: 'Наша зона обслуживания - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Зоны обслуживания и местоположения Mustafa Cangil Auto Trading Ltd..',
              seoKeywords: 'зона обслуживания,mustafa cangil motors,местоположения'
            }
          ]
        }
      }
    }),
    prisma.page.upsert({
      where: { id: 8 },
      update: {},
      create: {
        slug: 'about-team',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Uzman Ekibimiz',
              content: 'Alanında uzman, deneyimli ve müşteri odaklı ekibimizle hizmet veriyoruz. Her üyemiz sektörde yılların deneyimine sahip.',
              seoTitle: 'Uzman Ekibimiz - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. uzman ekibi ve deneyimli personeli.',
              seoKeywords: 'ekip,mustafa cangil motors,uzman'
            },
            {
              lang: 'en',
              title: 'Our Expert Team',
              content: 'We serve with our expert, experienced and customer-focused team. Each member of our team has years of experience in the sector.',
              seoTitle: 'Our Expert Team - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. expert team and experienced staff.',
              seoKeywords: 'team,mustafa cangil motors,expert'
            },
            {
              lang: 'ar',
              title: 'فريقنا الخبير',
              content: 'نحن نخدم مع فريقنا الخبير والذكي والمركز على العملاء. كل عضو في فريقنا لديه سنوات من الخبرة في القطاع.',
              seoTitle: 'فريقنا الخبير - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'فريق الخبراء والموظفين ذوي الخبرة في مصطفى جانجيل موتورز.',
              seoKeywords: 'فريق,مصطفى جانجيل موتورز,خبير'
            },
            {
              lang: 'ru',
              title: 'Наша экспертная команда',
              content: 'Мы обслуживаем с нашей экспертной, опытной и ориентированной на клиента командой. Каждый член нашей команды имеет многолетний опыт в отрасли.',
              seoTitle: 'Наша экспертная команда - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Экспертная команда и опытный персонал Mustafa Cangil Auto Trading Ltd..',
              seoKeywords: 'команда,mustafa cangil motors,эксперт'
            }
          ]
        }
      }
    }),
    prisma.page.upsert({
      where: { id: 9 },
      update: {},
      create: {
        slug: 'about-cta',
        translations: {
          create: [
            {
              lang: 'tr',
              title: 'Bizimle İletişime Geçin',
              content: 'Araç ihtiyaçlarınız için uzman ekibimizle görüşün. Size en uygun çözümü bulalım.',
              seoTitle: 'Bizimle İletişime Geçin - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Mustafa Cangil Auto Trading Ltd. ile iletişime geçin. Uzman ekibimizle görüşün.',
              seoKeywords: 'iletişim,mustafa cangil motors,uzman'
            },
            {
              lang: 'en',
              title: 'Contact Us',
              content: 'Consult with our expert team for your vehicle needs. Let us find the most suitable solution for you.',
              seoTitle: 'Contact Us - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Contact Mustafa Cangil Auto Trading Ltd.. Consult with our expert team.',
              seoKeywords: 'contact,mustafa cangil motors,expert'
            },
            {
              lang: 'ar',
              title: 'اتصل بنا',
              content: 'استشر فريقنا الخبير لاحتياجاتك من السيارات. دعنا نجد الحل الأنسب لك.',
              seoTitle: 'اتصل بنا - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'اتصل بمصطفى جانجيل موتورز. استشر فريقنا الخبير.',
              seoKeywords: 'اتصل بنا,مصطفى جانجيل موتورز,خبير'
            },
            {
              lang: 'ru',
              title: 'Свяжитесь с нами',
              content: 'Проконсультируйтесь с нашей экспертной командой по вашим потребностям в автомобилях. Давайте найдем наиболее подходящее решение для вас.',
              seoTitle: 'Свяжитесь с нами - Mustafa Cangil Auto Trading Ltd.',
              seoDescription: 'Свяжитесь с Mustafa Cangil Auto Trading Ltd.. Проконсультируйтесь с нашей экспертной командой.',
              seoKeywords: 'свяжитесь с нами,mustafa cangil motors,эксперт'
            }
          ]
        }
      }
    })
  ]);

  console.log('✅ About page sections created');

  // Create main about page
  await prisma.page.create({
    data: {
      slug: 'hakkimizda',
      translations: {
        create: [
          {
            lang: 'tr',
            title: 'Hakkımızda',
            content: 'Mustafa Cangil Auto Trading Ltd. olarak KKTC\'de 5 yılı aşkın süredir güvenilir araç ticareti yapıyoruz. Müşteri memnuniyeti odaklı hizmet anlayışımızla, kaliteli ve güvenilir araçları uygun fiyatlarla sunuyoruz.',
            seoTitle: 'Hakkımızda - Mustafa Cangil Auto Trading Ltd.',
            seoDescription: 'Mustafa Cangil Auto Trading Ltd. hakkında bilgi alın. KKTC\'de güvenilir araç ticareti.',
            seoKeywords: 'hakkımızda,mustafa cangil motors,KKTC araç galerisi'
          },
          {
            lang: 'en',
            title: 'About Us',
            content: 'As Mustafa Cangil Auto Trading Ltd., we have been providing reliable vehicle trading in Northern Cyprus for over 5 years. With our customer satisfaction-oriented service approach, we offer quality and reliable vehicles at affordable prices.',
            seoTitle: 'About Us - Mustafa Cangil Auto Trading Ltd.',
            seoDescription: 'Learn about Mustafa Cangil Auto Trading Ltd.. Reliable vehicle trading in Northern Cyprus.',
            seoKeywords: 'about us,mustafa cangil motors,northern cyprus car gallery'
          },
          {
            lang: 'ar',
            title: 'معلومات عنا',
            content: 'كشركة مصطفى جانجيل للتجارة السيارات المحدودة، نقوم بتجارة السيارات الموثوقة في شمال قبرص لأكثر من 5 سنوات. مع نهج خدمتنا الموجه نحو رضا العملاء، نقدم مركبات عالية الجودة وموثوقة بأسعار معقولة.',
            seoTitle: 'معلومات عنا - مصطفى جانجيل موتورز',
            seoDescription: 'تعرف على مصطفى جانجيل موتورز. تجارة السيارات الموثوقة في شمال قبرص.',
            seoKeywords: 'معلومات عنا,مصطفى جانجيل موتورز,معرض السيارات شمال قبرص'
          },
          {
            lang: 'ru',
            title: 'О нас',
            content: 'Как Mustafa Cangil Auto Trading Ltd., мы занимаемся надежной торговлей автомобилями в Северном Кипре уже более 5 лет. С нашим подходом к обслуживанию, ориентированным на удовлетворение клиентов, мы предлагаем качественные и надежные автомобили по доступным ценам.',
            seoTitle: 'О нас - Mustafa Cangil Auto Trading Ltd.',
            seoDescription: 'Узнайте о Mustafa Cangil Auto Trading Ltd.. Надежная торговля автомобилями в Северном Кипре.',
            seoKeywords: 'о нас,mustafa cangil motors,автогалерея северный кипр'
          }
        ]
      }
    }
  });

  console.log('✅ Main about page created');

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

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

