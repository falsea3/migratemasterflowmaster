import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Очистка существующих данных
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.purchaseProvider.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.user.deleteMany();
  await prisma.paymentSystem.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.catalog.deleteMany();
  await prisma.catalogCategory.deleteMany();
  await prisma.image.deleteMany();

  // Создаем изображения
  const image1 = await prisma.image.create({
    data: {
      id: uuidv4(),
      url: 'https://example.com/image1.jpg',
      directusId: 'dir1'
    }
  });

  const image2 = await prisma.image.create({
    data: {
      id: uuidv4(),
      url: 'https://example.com/image2.jpg',
      directusId: 'dir2'
    }
  });

  // Создаем категории каталога
  const catalogCategory = await prisma.catalogCategory.create({
    data: {
      id: uuidv4(),
      name: 'Игровые предметы'
    }
  });

  // Создаем каталог
  const catalog = await prisma.catalog.create({
    data: {
      id: uuidv4(),
      name: 'Популярные игры',
      position: 1,
      categoryId: catalogCategory.id,
      isActive: true,
      imgId: image1.id,
      largeImgId: image2.id,
      popularPosition: 1
    }
  });

  // Создаем элементы каталога
  const catalogItem = await prisma.catalogItem.create({
    data: {
      id: uuidv4(),
      pathUrl: '/games/popular',
      catalogId: catalog.id,
      checkAccount: true,
      imgId: image1.id,
      isActive: true,
      charge: '10%',
      name: 'Counter-Strike 2 Предметы',
      categoryId: catalogCategory.id,
      position: 1,
      isAvailable: true,
      pageLayoutName: 'CS2 Items',
      pageLayoutDescription: 'Купить предметы CS2'
    }
  });

  // Создаем платежную систему
  const paymentSystem = await prisma.paymentSystem.create({
    data: {
      id: uuidv4(),
      name: 'PayPal',
      position: 1,
      isActive: true,
      displayName: 'PayPal Payment',
      imgId: image1.id,
      caption: 'Оплата через PayPal',
      commission: 2.5,
      minSum: 100,
      maxSum: 100000
    }
  });

  // Создаем пользователя с уникальным email
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: `test${Date.now()}@example.com`, // Добавляем временную метку для уникальности
      userName: `testuser${Date.now()}`, // Добавляем временную метку для уникальности
      tgId: `${Date.now()}`, // Добавляем временную метку для уникальности
      tgUserName: `@testuser${Date.now()}`,
      googleEmail: `test${Date.now()}@gmail.com`,
      imgId: image1.id,
      verifyTokenHash: 'hash123',
      passwordHash: 'pass123hash',
      balance: 1000,
      role: 'user'
    }
  });

  // Создаем реферальную систему
  const referral = await prisma.referral.create({
    data: {
      id: uuidv4(),
      name: 'Приведи друга',
      code: 'FRIEND2023',
      type: 'friend',
      imgId: image1.id
    }
  });

  // Создаем провайдера покупок
  const purchaseProvider = await prisma.purchaseProvider.create({
    data: {
      id: uuidv4(),
      name: 'Steam Market',
      balance: 10000
    }
  });

  // Создаем категорию продуктов
  const productCategory = await prisma.productCategory.create({
    data: {
      id: uuidv4(),
      name: 'Ножи CS2',
      position: 1,
      isCategoryVisible: true,
      pathUrl: '/cs2/knives'
    }
  });

  // Создаем продукт
  const product = await prisma.product.create({
    data: {
      id: uuidv4(),
      catalogItemId: catalogItem.id,
      productCategoryId: productCategory.id,
      imgId: image1.id,
      price: 1000,
      oldPrice: 1200,
      limit: 10,
      description: 'Керамбит | Градиент',
      cashback: 5,
      position: 1,
      isActive: true,
      name: 'Karambit Fade',
      discount: 10,
      showDiscount: true,
      styleVariant: 'premium',
      tax: 0,
      charge: 100,
      helperType: 'tooltip',
      action: 'buy',
      type: 'knife',
      stock: 5
    }
  });

  console.log('Сиды успешно созданы');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });