import chalk from 'chalk';
import {Prisma} from '@prisma/client';
import {PrismaClient as NewPrisma} from './generated/new-client/index.js';
import {PrismaClient as OldPrisma} from './generated/legacy-client/index.js';

const oldPrisma = new OldPrisma();
const newPrisma = new NewPrisma();

const warning = chalk.hex('#FFA500');
const success = chalk.green;
const info = chalk.dim;

const imageIdMap = new Map();
const catalogIdMap = new Map();
const catalogCategoryIdMap = new Map();
const catalogItemMap = new Map();
const productCategoryIdMap = new Map();
const usersIdMap = new Map();
const referralsIdMap = new Map();
const paymentSystemIdMap = new Map();
const orderIdMap = new Map();
const cartItemIdMap = new Map();
const purchaseProviderIdMap = new Map();
const productIdMap = new Map();
let t = 0;

function logSection(title, width = 60) {
    const totalPadding = width - title.length;
    const side = '.'.repeat(Math.max(2, Math.floor(totalPadding)));
    const line = '...... ' + title + ' ' + side;
    console.log(chalk.gray(''));
    console.log(chalk.gray(line));
}

async function clearDB(tx) {
    logSection('start clear');

    // Зависимости между таблицами учитываем - сначала удаляем "детей", потом "родителей"

    await tx.userReferral.deleteMany();
    await tx.referral.deleteMany();

    await tx.usedProductCode.deleteMany();        // зависит от cartItem
    await tx.cartItem.deleteMany();

    await tx.purchaseProviderOrder.deleteMany();  // зависит от order
    await tx.order.deleteMany();

    await tx.productPurchaseProvider.deleteMany();
    await tx.catalogItemPurchaseProvider.deleteMany();

    await tx.purchaseProvider.deleteMany();

    await tx.product.deleteMany();
    await tx.catalogItemParams.deleteMany();
    await tx.catalogItem.deleteMany();

    await tx.catalog.deleteMany();

    await tx.catalogCategoryPaymentSystem.deleteMany()

    await tx.catalogCategory.deleteMany();

    await tx.paymentSystem.deleteMany();

    await tx.productCategory.deleteMany();

    await tx.user.deleteMany();

    await tx.image.deleteMany();

    console.log(success('✅ База очищена!'));
}


async function migrateImage(tx) {
    logSection('start image');
    const oldImages = await oldPrisma.image.findMany();
    console.log(info(`В старой базе: ${oldImages.length}`));
    let migrated = 0;

    for (const oldImage of oldImages) {
        const newImage = {
            url: oldImage.url,
            directusId: oldImage.fileKey,
            createdAt: oldImage.createdAt,
            updatedAt: oldImage.updatedAt,
            deletedAt: oldImage.deletedAt,
        };
        const client = tx ?? newPrisma;
        const res = await client.image.create({data: newImage});
        imageIdMap.set(oldImage.id, res.id);

        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateCatalogCategory(tx) {
    logSection('start catalog category');
    const oldCatalogCategories = await oldPrisma.catalogCategory.findMany();
    console.log(info(`В старой базе: ${oldCatalogCategories.length}`));
    let migrated = 0;

    for (const oldCatalogCategory of oldCatalogCategories) {
        const data = {
            name: oldCatalogCategory.name
        }
        const res = await tx.catalogCategory.create({data});
        catalogCategoryIdMap.set(String(oldCatalogCategory.id), res.id);
        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateCatalog(tx) {
    logSection('start catalog');
    const oldCatalogs = await oldPrisma.catalog.findMany();
    console.log(info(`В старой базе: ${oldCatalogs.length}`));
    let migrated = 0;

    for (const oldCatalog of oldCatalogs) {
        const newCatalog = {
            name: oldCatalog.name,
            position: oldCatalog.rating,
            categoryId: catalogCategoryIdMap.get(String(oldCatalog.catalogCategoryId)),
            isActive: oldCatalog.isActive ?? false,
            imgId: imageIdMap.get(oldCatalog.imgId),
            largeImgId: imageIdMap.get(oldCatalog.largeImgId) ?? null,
            popularPosition: oldCatalog.popularPosition ?? 0,
        };
        const res = await tx.catalog.create({
            data: newCatalog,
        });
        catalogIdMap.set(oldCatalog.id, res.id);
        // console.log(oldCatalog.id + ' ' + res.id);
        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateCatalogItem(tx) {
    logSection('start catalog item');
    const oldCatalogItems = await oldPrisma.catalogItem.findMany();
    console.log(info(`В старой базе: ${oldCatalogItems.length}`));
    let migrated = 0;

    for (const oldCatalogItem of oldCatalogItems) {
        const categoryOld = await oldPrisma.catalogCategory.findFirst({
            where: {
                name: oldCatalogItem.category,
            }
        })
        const pageLayoutOld = await oldPrisma.catalogItemPageLayout.findFirst({
            where: {
                id: oldCatalogItem.pageLayoutId,
            }
        })
        if (!categoryOld) {
            console.log(warning(`⚠️   Для catalogItem ${oldCatalogItem.name} (id: ${oldCatalogItem.id}) не найдена категория!`));
            continue;
        }
        if (!pageLayoutOld) {
            console.log(warning(`⚠️   Для catalogItem ${oldCatalogItem.name} (id: ${oldCatalogItem.id}) не найден pageLayout!`));
            continue;
        }
        const catalogId = catalogIdMap.get(oldCatalogItem.catalogId) ?? null;
        if (!catalogId) {
            console.warn(warning(`⚠️   Для catalogItem ${oldCatalogItem.name} (id: ${oldCatalogItem.id}) не найден catalogId!`));
            continue;
        }
        const categoryId = catalogCategoryIdMap.get(String(categoryOld.id));
        if (!categoryId) {
            console.warn(warning(`⚠️   Для catalogItem ${oldCatalogItem.name} (id: ${oldCatalogItem.id}) не найден categoryId!`));
            continue;
        }
        const imgId = imageIdMap.get(oldCatalogItem.imgId) ?? null;
        if (!imgId) {
            console.warn(warning(`⚠️   Для catalogItem ${oldCatalogItem.name} (id: ${oldCatalogItem.id}) не найдена картинка!`));
        }

        const newCatalogItem = {
            pathUrl: oldCatalogItem.pathUrl,
            catalogId: catalogId,
            categoryId: categoryId,
            checkAccount: oldCatalogItem.checkAccount ?? false,
            imgId: imgId,
            isActive: oldCatalogItem.isActive ?? false,
            charge: String(oldCatalogItem.charge) ?? null,
            name: oldCatalogItem.name,
            position: oldCatalogItem.position ?? 0,
            isAvailable: oldCatalogItem.isAvailable ?? false,
            pageLayoutName: pageLayoutOld.name,
            pageLayoutDescription: pageLayoutOld.description
        };
        const res = await tx.catalogItem.create({
            data: newCatalogItem,
        });
        catalogItemMap.set(oldCatalogItem.id, res.id);
        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateCatalogItemParams(tx) {
    logSection('start catalog item params');
    const oldCatalogItemParams = await oldPrisma.catalogItemParams.findMany();
    console.log(info(`В старой базе: ${oldCatalogItemParams.length}`));
    let migrated = 0;
    for (const oldCatalogItemParam of oldCatalogItemParams) {
        const catalogItemId = catalogItemMap.get(oldCatalogItemParam.catalogItemId) ?? null;
        if (!catalogItemId) {
            console.warn(warning(`⚠️   Для catalogItemParam (id: ${oldCatalogItemParam.id}) не найден catalogItemId!`));
            continue;
        }

        const newCatalogItemParam = {
            catalogItemId: catalogItemId,
            name: oldCatalogItemParam.name,
            historyDisplayText: oldCatalogItemParam.historyDisplayText,
            directusId: oldCatalogItemParam.directusId ? oldCatalogItemParam.directusId.toString() : null,
        }
        await tx.catalogItemParams.create({
            data: newCatalogItemParam,
        })
        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateProductCategories(tx) {
    logSection('start product category');
    const oldProductCategories = await oldPrisma.productCategory.findMany();
    console.log(info(`В старой базе: ${oldProductCategories.length}`));
    let migrated = 0;

    for (const oldProductCategory of oldProductCategories) {
        const newProductCategory = {
            name: oldProductCategory.name,
            position: oldProductCategory.position,
            isCategoryVisible: oldProductCategory.isCategoryVisible,
            pathUrl: oldProductCategory.pathUrl,
        }
        const res = await tx.productCategory.create({
            data: newProductCategory,
        })
        productCategoryIdMap.set(oldProductCategory.id, res.id);
        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migratePaymentSystems(tx) {
    logSection('start payment systems');
    const oldPaymentSystems = await oldPrisma.paymentSystem.findMany();
    console.log(info(`В старой базе: ${oldPaymentSystems.length}`));
    let migrated = 0;

    for (const oldPaymentSystem of oldPaymentSystems) {
        const imgId = imageIdMap.get(oldPaymentSystem.imageId) ?? null;
        if (!imgId) {
            console.warn(warning(`⚠️   Для paymentSystem ${oldPaymentSystem.name} (id: ${oldPaymentSystem.id}) не найдена картинка!`));
        }

        const newPaymentSystem = {
            name: oldPaymentSystem.name,
            position: oldPaymentSystem.position,
            isActive: oldPaymentSystem.isActive,
            displayName: oldPaymentSystem.displayName,
            imgId: imgId,
            caption: oldPaymentSystem.caption,
            commission: oldPaymentSystem.commission,
            minSum: oldPaymentSystem.minSum.toNumber(),
            maxSum: oldPaymentSystem.maxSum.toNumber(),
        }
        const res = await tx.paymentSystem.create({
            data: newPaymentSystem,
        });
        paymentSystemIdMap.set(oldPaymentSystem.id, res.id);
        migrated++;
    }
    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateCatalogCategoryPaymentSystem(tx) {
    logSection('start catalog category payment system');
    const oldCatalogCategoryPaymentSystems = await oldPrisma.paymentSystemCatalogCategory.findMany();
    console.log(info(`В старой базе: ${oldCatalogCategoryPaymentSystems.length}`));
    let migrated = 0;

    for (const oldCatalogItemPaymentSystem of oldCatalogCategoryPaymentSystems) {
        const customCatalogCategoryId = oldCatalogItemPaymentSystem.catalogCategoryId;
        const catalogCategoryId = catalogCategoryIdMap.get(String(customCatalogCategoryId));
        if (!catalogCategoryId) {
            console.warn(warning(`⚠️   Для catalogItemPaymentSystem ${oldCatalogItemPaymentSystem.catalogCategoryId} (id: ${oldCatalogItemPaymentSystem.id}) не найдена категория!`));
            continue;
        }
        const paymentSystemId = paymentSystemIdMap.get(oldCatalogItemPaymentSystem.paymentSystemId);
        if (!paymentSystemId) {
            console.warn(warning(`⚠️   Для catalogItemPaymentSystem ${oldCatalogItemPaymentSystem.catalogItemId} (id: ${oldCatalogItemPaymentSystem.id}) не найдена платежная система!`));
            continue;
        }
        const newCatalogItemPaymentSystem = {
            catalogCategoryId: catalogCategoryId,
            paymentSystemId: paymentSystemId,
            position: oldCatalogItemPaymentSystem.position ?? null,
        }
        await tx.CatalogCategoryPaymentSystem.create({
            data: newCatalogItemPaymentSystem,
        })
        migrated++;
    }
    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateProducts(tx) {
    logSection('migrate products');
    const oldProducts = await oldPrisma.product.findMany();
    console.log(info(`В старой базе: ${oldProducts.length}`));
    let migrated = 0;
    let missingImages = 0;

    for (const oldProduct of oldProducts) {
        const catalogItemId = catalogItemMap.get(oldProduct.catalogItemId);
        if (!catalogItemId) {
            console.warn(warning(`⚠️   Для продукта ${oldProduct.name} (id: ${oldProduct.id}) не найден catalogItemId!`));
            console.log(catalogItemMap);
            continue;
        }
        const productCategoryId = productCategoryIdMap.get(oldProduct.productCategoryId);

        if (!productCategoryId) {
            console.warn(warning(`⚠️   Для продукта ${oldProduct.name} (id: ${oldProduct.id}) не найден productCategoryId!`));
            console.log(productCategoryIdMap);
            continue;
        }

        const imgId = imageIdMap.get(oldProduct.imgId);
        if (!imgId) {
            console.warn(warning(`⚠️   Для продукта ${oldProduct.name} (id: ${oldProduct.id} ${oldProduct.imgId}) не найдена картинка!`));
            missingImages++;
            continue;
        }

        const newProduct = {
            catalogItemId: catalogItemId,
            productCategoryId: productCategoryId,
            imgId: imgId,
            price: oldProduct.price,
            oldPrice: oldProduct.oldPrice ?? 0,
            limit: oldProduct.limit,
            description: oldProduct.description ?? null,
            cashback: oldProduct.cashback ?? null,
            position: oldProduct.position ?? null,
            isActive: oldProduct.isActive ?? false,
            name: oldProduct.name,
            discount: oldProduct.discount ?? null,
            showDiscount: oldProduct.showDiscount ?? false,
            styleVariant: oldProduct.styleVariant ?? null,
            tax: oldProduct.tax ?? 0,
            helperContent: oldProduct.helperContent ?? null,
            isForbiddenChangingPrice: oldProduct.isForbiddenChangingPrice ?? false,
            charge: oldProduct.charge,
            helperType: oldProduct.helperType ?? null,
            note: oldProduct.note ?? null,
            externalLink: oldProduct.externalLink ?? null,
            action: oldProduct.action,
            type: oldProduct.type,
            stock: oldProduct.stock,
        }
        const res = await tx.product.create({
            data: newProduct,
        });
        productIdMap.set(oldProduct.id, res.id);
        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    if (missingImages > 0) {
        console.warn(warning(`⚠️ Продуктов без найденной картинки: ${missingImages}`));
    }
    t++
}

async function migrateUsers(tx) {
    logSection('start users');
    const oldUsers = await oldPrisma.user.findMany();
    console.log(info(`В старой базе: ${oldUsers.length}`));
    let migrated = 0;
    let missingImages = 0;

    for (const oldUser of oldUsers) {
        const isGuest = oldUser.username === null;
        const imgId = imageIdMap.get(oldUser.imgId) ?? null;
        if (!imgId && !isGuest) {
            // console.warn(warning(`⚠️   Для пользователя ${oldUser.username || oldUser.email} (id: ${oldUser.id}) не найдена картинка!`));
            missingImages++;
        }
        const newUser = {
            email:  null,
            userName: null,
            tgId:  null,
            tgUserName: oldUser.username ?? null,
            googleEmail: oldUser.googleEmail ?? null, // ???,
            imgId: imgId,
            verifyTokenHash: null,
            passwordHash: null,
            balance: 0,
            restoreTokenHash: null,
            role: isGuest ? 'guest' : 'user',
            createdAt: oldUser.createdAt,
            updatedAt: oldUser.updateAt,
            deletedAt: oldUser.deleteDate,
        };
        const res = await tx.user.create({
            data: newUser,
        });

        usersIdMap.set(oldUser.id, res.id);
        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ ${migrated} перенесено`));
    }
    if (missingImages > 0) {
        console.warn(warning(`⚠️   Пользователей без найденной картинки: ${missingImages}`));
    }
    t++
}

async function migrateReferrals(tx) {
    logSection('start referrals');
    const oldReferrals = await oldPrisma.referral.findMany();
    console.log(info(`В старой базе: ${oldReferrals.length}`));
    let migrated = 0;
    for (const oldReferral of oldReferrals) {
        const imgId = imageIdMap.get(oldReferral.imageId) ?? null;
        if (!imgId) {
            console.warn(warning(`⚠️   Для реферала ${oldReferral.name} (id: ${oldReferral.id}) не найдена картинка!`));
        }
        const newReferral = {
            name: oldReferral.name,
            code: oldReferral.code,
            type: oldReferral.type,
            imgId: imgId,
            createdAt: oldReferral.createdAt,
            updatedAt: oldReferral.updatedAt,
            deletedAt: oldReferral.deletedAt,
        }
        const res = await tx.referral.create({
            data: newReferral,
        })
        referralsIdMap.set(oldReferral.code, res.id);
        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateUserReferral(tx) {
    logSection('start user referral');
    const oldUserReferrals = await oldPrisma.userReferral.findMany();
    console.log(info(`В старой базе: ${oldUserReferrals.length}`));
    let migrated = 0;

    for (const oldUserReferral of oldUserReferrals) {
        const userId = usersIdMap.get(oldUserReferral.userId);
        const referralId = referralsIdMap.get(oldUserReferral.referralCode);

        if (!referralId) {
            console.warn(warning(`⚠️   Для userReferral (id: ${oldUserReferral.id}) не найден referralId!`));
            continue;
        }
        if (!userId) {
            console.warn(warning(`⚠️   Для пользователя ${oldUserReferral.userId} (id: ${oldUserReferral.id}) не найден!`));
            continue;
        }
        const newUserReferral = {
            userId: userId,
            referralId: referralId,
            relation: oldUserReferral.relation,
            createdAt: oldUserReferral.createdAt,
            updatedAt: oldUserReferral.updatedAt,
            deletedAt: oldUserReferral.deleteAt,
        }
        const res = await tx.userReferral.create({
            data: newUserReferral,
        })

        migrated++;
    }

    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateOrders(tx) {
    logSection('start orders');
    const oldOrders = await oldPrisma.order.findMany();
    console.log(info(`В старой базе: ${oldOrders.length}`));
    let migrated = 0;
    for (const oldOrder of oldOrders) {
        const userId = usersIdMap.get(String(oldOrder.userId))

        if (!userId) {
            console.warn(warning(`⚠️   Для заказа (id: ${oldOrder.id}) не найден userId!`));
            continue;
        }
        const catalogItemId = catalogItemMap.get(oldOrder.catalogItemId) ?? null;

        if (!catalogItemId) {
            // console.warn(warning(`⚠️   Для заказа(id: ${oldOrder.id}) не найден catalogItemId!`));
            // console.log(catalogItemMap)
            continue;
        }

        const paymentSystemId = paymentSystemIdMap.get(oldOrder.paymentSystemId) ?? null;
        
        // console.log(paymentSystemIdMap, oldOrder.paymentSystemId);

        if (!paymentSystemId) {
            // console.warn(warning(`⚠️   Для заказа (id: ${oldOrder.id}) не найден paymentSystemId!`));
            // console.log(paymentSystemIdMap)
            continue;
        }

        const referralId = referralsIdMap.get(oldOrder.referralCode) ?? null;

        const newOrder = {
            totalAmount: oldOrder.totalAmount,
            catalogItemId: String(catalogItemId),
            orderNumber: Number(oldOrder.id),
            accountUid: oldOrder.accountUid,
            server: oldOrder.server ?? null,
            commission: oldOrder.commission ?? null,
            paidAmountToPurchaseProvider: Number(oldOrder.paidAmountToPurchaseProvider) ?? null,
            paymentSystemId: String(paymentSystemId),
            status: String(oldOrder.status),
            paymentUrl: oldOrder.paymentUrl,
            referralId: referralId ? String(referralId) : null,
            region: oldOrder.region ?? null,
            userId: String(userId),
            sendAt: oldOrder.sendDate ?? null,
            payedAt: oldOrder.payedDate ?? null,
            createdAt: oldOrder.createdAt,
            updatedAt: oldOrder.updatedAt,
            deletedAt: oldOrder.deletedAt ?? null,
        }
        const res = await tx.order.create({
            data: newOrder,
        })
        
        orderIdMap.set(oldOrder.id, res.id);
        migrated++;
    }
    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateCartItem(tx) {
    logSection('start cart item');
    const oldCartItems = await oldPrisma.cartItem.findMany();
    console.log(info(`В старой базе: ${oldCartItems.length}`));
    let migrated = 0;
    for (const oldCartItem of oldCartItems) {
        const productId = productIdMap.get(oldCartItem.productId);
        if (!productId) {
            console.warn(warning(`⚠️   Для cartItem (id: ${oldCartItem.id}) не найден productId!`));
            continue;
        }
        const orderId = orderIdMap.get(oldCartItem.orderId) ?? null;
        // console.log(orderId, oldCartItem.orderId, oldCartItem.id)
        // console.log(orderIdMap)
        if (!orderId) {
            console.warn(warning(`⚠️   Для cartItem (id: ${oldCartItem.id}) не найден orderId!`));
            continue;
        }
        const newCartItem = {
            price: oldCartItem.price,
            count: oldCartItem.count,
            productId: String(productId),
            orderId: String(orderId),
            cashback: oldCartItem.cashback,
            tax: oldCartItem.tax ?? 0,
        }

        const res = await tx.cartItem.create({
            data: newCartItem,
        })

        cartItemIdMap.set(oldCartItem.id, res.id);

        migrated++;
    }
    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateUsedProductCodes(tx) {
    logSection('start used product codes');
    const oldUsedProductCodes = await oldPrisma.issuedProductCode.findMany();
    console.log(info(`В старой базе: ${oldUsedProductCodes.length}`));
    let migrated = 0;
    for (const oldUsedProductCode of oldUsedProductCodes) {
        const cartItemId = cartItemIdMap.get(oldUsedProductCode.cartItemId);
        if (!cartItemId) {
            console.warn(warning(`⚠️   Для usedProductCode ${oldUsedProductCode.id} (id: ${oldUsedProductCode.id}) не найден cartItemId!`));
            console.log(cartItemIdMap);
            continue;
        }
        const newUsedProductCode = {
            code: oldUsedProductCode.content,
            cartItemId: String(cartItemId),
            createdAt: oldUsedProductCode.createdAt,
            updatedAt: oldUsedProductCode.createdAt,
        }
        await tx.usedProductCode.create({
            data: newUsedProductCode,
        })
        migrated++;
    }
    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migratePurchaseProviders(tx) {
    logSection('start purchase providers');
    const oldPurchaseProviders = await oldPrisma.purchaseProvider.findMany();
    console.log(info(`В старой базе: ${oldPurchaseProviders.length}`));
    let migrated = 0;
    for (const oldPurchaseProvider of oldPurchaseProviders) {
        if (oldPurchaseProvider.name === 'FOREIGN') {
            continue
        }
        const newPurchaseProvider = {
            name: oldPurchaseProvider.name,
            balance: oldPurchaseProvider.balance,
        }
        const res = await tx.purchaseProvider.create({
            data: newPurchaseProvider,
        })
        purchaseProviderIdMap.set(oldPurchaseProvider.id, res.id);
        migrated++;
    }
    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateCatalogItemPurchaseProvider(tx) {
    logSection('start catalog item purchase provider');
    const oldCatalogItemPurchaseProviders = await oldPrisma.catalogPurchaseProvider.findMany();
    console.log(info(`В старой базе: ${oldCatalogItemPurchaseProviders.length}`));
    let migrated = 0;

    for (const oldCatalogItemPurchaseProvider of oldCatalogItemPurchaseProviders) {

        const catalogItemId = catalogItemMap.get(oldCatalogItemPurchaseProvider.catalogItemId);
        if (!catalogItemId) {
            console.warn(warning(`⚠️   Для catalogItemPurchaseProvider ${oldCatalogItemPurchaseProvider.catalogItemId} (id: ${oldCatalogItemPurchaseProvider.id}) не найден catalogItemId!`));
            console.log(catalogItemMap);
            continue;
        }
        const purchaseProviderId = purchaseProviderIdMap.get(oldCatalogItemPurchaseProvider.purchaseProviderId);
        if (!purchaseProviderId) {
            console.warn(warning(`⚠️   Для catalogItemPurchaseProvider ${oldCatalogItemPurchaseProvider.catalogItemId} (id: ${oldCatalogItemPurchaseProvider.id}) не найден purchaseProviderId!`));
            console.log(purchaseProviderIdMap);
            continue;
        }

        const newCatalogItemPurchaseProvider = {
            partnerId: oldCatalogItemPurchaseProvider.partnerId,
            isRun: oldCatalogItemPurchaseProvider.isRun,
            catalogItemId: catalogItemId,
            purchaseProviderId: purchaseProviderId,
        }
        await tx.catalogItemPurchaseProvider.create({
            data: newCatalogItemPurchaseProvider,
        })
        migrated++;
    }
    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migratePurchaseProviderOrder(tx) {
    logSection('start purchase provider order');
    const oldPurchaseProviderOrders = await oldPrisma.purchaseProviderOrder.findMany();
    console.log(info(`В старой базе: ${oldPurchaseProviderOrders.length}`));
    let migrated = 0;
    for (const oldPurchaseProviderOrder of oldPurchaseProviderOrders) {
        const orderId = orderIdMap.get(BigInt(oldPurchaseProviderOrder.orderId));
        if (!orderId) {
            console.warn(warning(`⚠️   Для purchaseProviderOrder ${oldPurchaseProviderOrder.id} (id: ${oldPurchaseProviderOrder.id}) не найден orderId!`));
            console.log(orderIdMap);
            continue;
        }

        const h = BigInt(oldPurchaseProviderOrder.purchaseProviderId);
        const purchaseProviderId = purchaseProviderIdMap.get(h);

        if (!purchaseProviderId) {
            console.warn(warning(`⚠️   Для purchaseProviderOrder ${oldPurchaseProviderOrder.id} не найден purchaseProviderId!`));
            console.log(purchaseProviderIdMap);
            continue;
        }
        const productId = productIdMap.get(oldPurchaseProviderOrder.productId);
        if (!productId) {
            console.warn(warning(`⚠️   Для purchaseProviderOrder ${oldPurchaseProviderOrder.id} (id: ${oldPurchaseProviderOrder.id}) не найден productId!`));
            console.log(productIdMap);
            continue;
        }

        const newPurchaseProviderOrder = {
            orderId: orderId,
            purchaseProviderId: purchaseProviderId,
            providerExternalOrderId: oldPurchaseProviderOrder.merchantCode ?? '',
            providerInternalOrderId: oldPurchaseProviderOrder.providerOrderCode ?? '',
            isCompleted: oldPurchaseProviderOrder.isCompleted ?? false,
            amountUsd: new Prisma.Decimal(oldPurchaseProviderOrder.amountUSD ?? 0),
            amountRub: new Prisma.Decimal(oldPurchaseProviderOrder.amountRUB ?? 0),
            productId: productId ?? null,
            count: oldPurchaseProviderOrder.count,
        }
        await tx.purchaseProviderOrder.create({
            data: newPurchaseProviderOrder,
        })
        migrated++;
    }
    if (migrated > 0) {
        console.log(success(`✅ Переносено: ${migrated}`));
    }
    t++
}

async function migrateProductPurchaseProvider(tx) {
    logSection('start product purchase provider');
    const oldProductPurchaseProviders = await oldPrisma.productPurchaseProvider.findMany();
    console.log(info(`В старой базе: ${oldProductPurchaseProviders.length}`));

    let migrated = 0;

    for (const oldProductPurchaseProvider of oldProductPurchaseProviders) {
        const purchaseProviderId = purchaseProviderIdMap.get(oldProductPurchaseProvider.purchaseProviderId)
        if (!purchaseProviderId) {
            console.warn(warning(`⚠️   Для productPurchaseProvider ${oldProductPurchaseProvider.id} (id: ${oldProductPurchaseProvider.id}) не найден purchaseProviderId!`));
            console.log(purchaseProviderIdMap);
            continue;
        }
        const productId = productIdMap.get(oldProductPurchaseProvider.productId)
        if (!productId) {
            console.warn(warning(`⚠️   Для productPurchaseProvider ${oldProductPurchaseProvider.id} (id: ${oldProductPurchaseProvider.id}) не найден productId!`));
            console.log(productIdMap);
            continue;
        }
        const newProductPurchaseProvider = {
            price: oldProductPurchaseProvider.price ?? null,
            partnerId: oldProductPurchaseProvider.partnerId,
            purchaseProviderId: purchaseProviderId,
            productId: productId,
            charge: oldProductPurchaseProvider.charge ?? null,
        };

        try {
            await tx.productPurchaseProvider.create({
                data: newProductPurchaseProvider,
            });
            migrated++;
        } catch (error) {
            console.error(`❌ Ошибка на записи productPurchaseProvider с ID ${oldProductPurchaseProvider.id}:`, error.message);
        }
    }

    if (migrated > 0) {
        console.log(success(`✅ Перенесено: ${migrated}`));
    }

    t++;
}

async function main() {
    try {
        await newPrisma.$transaction(async (tx) => {
            await clearDB(tx);
            await migrateProductCategories(tx);
            await migrateImage(tx);
            await migrateCatalogCategory(tx);
            await migrateCatalog(tx);
            await migrateCatalogItem(tx);
            await migrateCatalogItemParams(tx);
            await migratePaymentSystems(tx);
            await migrateCatalogCategoryPaymentSystem(tx);
            await migrateProducts(tx);
            await migrateUsers(tx);
            await migrateReferrals(tx);
            await migrateUserReferral(tx);
            await migrateOrders(tx);
            await migrateCartItem(tx);
            await migrateUsedProductCodes(tx);
            await migratePurchaseProviders(tx);
            await migrateCatalogItemPurchaseProvider(tx);
            await migratePurchaseProviderOrder(tx);
            await migrateProductPurchaseProvider(tx);
        }, {
            timeout: 1000000
        });
        console.log('');
        console.log(chalk.bold.green('Миграция завершена успешно'));
        console.log(chalk.bold.blue(`Таблиц: ${t}`));
    } catch (error) {
        console.error(chalk.red.bold('Ошибка миграции:', error));
    } finally {
        await oldPrisma.$disconnect();
        await newPrisma.$disconnect();
    }
}

main()