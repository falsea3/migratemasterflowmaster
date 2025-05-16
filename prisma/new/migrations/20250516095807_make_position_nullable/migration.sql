-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "user_name" TEXT,
    "tg_id" TEXT,
    "tg_user_name" TEXT,
    "google_email" TEXT,
    "public_id" SERIAL NOT NULL,
    "img_id" UUID,
    "verify_token_hash" TEXT,
    "password_hash" TEXT,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "restore_token_hash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'guest',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "directus_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "category_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "img_id" UUID,
    "large_img_id" UUID,
    "popular_position" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" UUID NOT NULL,
    "path_url" TEXT NOT NULL,
    "catalog_id" UUID NOT NULL,
    "check_account" BOOLEAN NOT NULL DEFAULT false,
    "img_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "charge" TEXT,
    "name" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "position" INTEGER,
    "is_available" BOOLEAN NOT NULL DEFAULT false,
    "page_layout_name" TEXT NOT NULL,
    "page_layout_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_item_params" (
    "id" UUID NOT NULL,
    "catalog_item_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "history_display_text" TEXT NOT NULL,
    "directus_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "catalog_item_params_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_item_payment_system" (
    "id" UUID NOT NULL,
    "catalog_category_id" UUID NOT NULL,
    "payment_system_id" UUID NOT NULL,
    "position" INTEGER,

    CONSTRAINT "catalog_item_payment_system_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "catalog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_systems" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "display_name" TEXT NOT NULL,
    "img_id" UUID NOT NULL,
    "caption" TEXT,
    "commission" DECIMAL(10,4),
    "min_sum" INTEGER NOT NULL DEFAULT 0,
    "max_sum" INTEGER NOT NULL DEFAULT 9999999,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payment_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_item_purchase_provider" (
    "id" UUID NOT NULL,
    "partner_id" TEXT NOT NULL,
    "is_run" BOOLEAN NOT NULL DEFAULT false,
    "catalog_item_id" UUID NOT NULL,
    "purchase_provider_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "catalog_item_purchase_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "img_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_referral" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "referral_id" UUID NOT NULL,
    "relation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_providers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "purchase_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_provider_order" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "purchase_provider_id" UUID NOT NULL,
    "provider_external_order_id" TEXT NOT NULL,
    "provider_internal_order_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "amount_usd" DECIMAL(10,4),
    "amount_rub" DECIMAL(10,4),
    "product_id" UUID,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "purchase_provider_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_purchase_provider" (
    "id" UUID NOT NULL,
    "price" INTEGER,
    "partner_id" TEXT NOT NULL,
    "purchase_provider_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "charge" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_purchase_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "is_category_visible" BOOLEAN NOT NULL DEFAULT false,
    "path_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "catalog_item_id" UUID NOT NULL,
    "product_category_id" UUID NOT NULL,
    "img_id" UUID,
    "price" DECIMAL(10,4) NOT NULL,
    "old_price" DECIMAL(10,4),
    "limit" INTEGER NOT NULL,
    "description" TEXT,
    "cashback" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "show_discount" BOOLEAN NOT NULL DEFAULT false,
    "style_variant" TEXT NOT NULL,
    "tax" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "helper_content" TEXT,
    "is_forbidden_changing_price" BOOLEAN NOT NULL DEFAULT false,
    "charge" DECIMAL(10,4) NOT NULL,
    "helper_type" TEXT NOT NULL,
    "note" TEXT,
    "external_link" TEXT,
    "action" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "catalog_item_id" UUID NOT NULL,
    "order_number" SERIAL NOT NULL,
    "account_uid" TEXT NOT NULL,
    "server" TEXT,
    "commission" DECIMAL(10,4),
    "paid_amount_to_purchase_provider" INTEGER,
    "payment_system_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "payment_url" TEXT NOT NULL,
    "referral_id" UUID,
    "region" TEXT,
    "user_id" UUID NOT NULL,
    "send_at" TIMESTAMP(3),
    "payed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "price" DECIMAL(10,4) NOT NULL,
    "count" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "cashback" INTEGER NOT NULL,
    "tax" DECIMAL(10,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_currencies" (
    "id" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "closePrice" DECIMAL(65,30) NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "service_currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "used_product_codes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "cart_item_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "used_product_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_tg_id_key" ON "users"("tg_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_public_id_key" ON "users"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_providers_name_key" ON "purchase_providers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_purchase_provider_purchase_provider_id_key" ON "product_purchase_provider"("purchase_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_purchase_provider_product_id_key" ON "product_purchase_provider"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "service_currencies_currency_key" ON "service_currencies"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "used_product_codes_cart_item_id_key" ON "used_product_codes"("cart_item_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_img_id_fkey" FOREIGN KEY ("img_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogs" ADD CONSTRAINT "catalogs_img_id_fkey" FOREIGN KEY ("img_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogs" ADD CONSTRAINT "catalogs_large_img_id_fkey" FOREIGN KEY ("large_img_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogs" ADD CONSTRAINT "catalogs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "catalog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_img_id_fkey" FOREIGN KEY ("img_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "catalog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_params" ADD CONSTRAINT "catalog_item_params_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_payment_system" ADD CONSTRAINT "catalog_item_payment_system_catalog_category_id_fkey" FOREIGN KEY ("catalog_category_id") REFERENCES "catalog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_payment_system" ADD CONSTRAINT "catalog_item_payment_system_payment_system_id_fkey" FOREIGN KEY ("payment_system_id") REFERENCES "payment_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_systems" ADD CONSTRAINT "payment_systems_img_id_fkey" FOREIGN KEY ("img_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_purchase_provider" ADD CONSTRAINT "catalog_item_purchase_provider_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_purchase_provider" ADD CONSTRAINT "catalog_item_purchase_provider_purchase_provider_id_fkey" FOREIGN KEY ("purchase_provider_id") REFERENCES "purchase_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_img_id_fkey" FOREIGN KEY ("img_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_referral" ADD CONSTRAINT "user_referral_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_referral" ADD CONSTRAINT "user_referral_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_provider_order" ADD CONSTRAINT "purchase_provider_order_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_provider_order" ADD CONSTRAINT "purchase_provider_order_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_provider_order" ADD CONSTRAINT "purchase_provider_order_purchase_provider_id_fkey" FOREIGN KEY ("purchase_provider_id") REFERENCES "purchase_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_purchase_provider" ADD CONSTRAINT "product_purchase_provider_purchase_provider_id_fkey" FOREIGN KEY ("purchase_provider_id") REFERENCES "purchase_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_purchase_provider" ADD CONSTRAINT "product_purchase_provider_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_img_id_fkey" FOREIGN KEY ("img_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "used_product_codes" ADD CONSTRAINT "used_product_codes_cart_item_id_fkey" FOREIGN KEY ("cart_item_id") REFERENCES "cart_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
