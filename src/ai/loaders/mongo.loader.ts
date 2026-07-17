import { Document } from "@langchain/core/documents";

import Product from "../../../models/Product";
import Category from "../../../models/Category";
import SiteContent from "../../../models/SiteContent";
import Slider from "../../../models/Slider";

export class MongoLoader {
  async loadKnowledge(): Promise<Document[]> {
    const documents: Document[] = [];

    const [products, categories, siteContents, sliders] = await Promise.all([
      Product.find().lean(),
      Category.find().lean(),
      SiteContent.find().lean(),
      Slider.find().lean(),
    ]);

    // ===========================
    // Products
    // ===========================

    for (const product of products) {
      documents.push(
        new Document({
          pageContent: `
Decoration Name: ${product.name}

Category: ${product.categoryName}

Price: ₹${product.price}

Description:
${product.description ?? ""}

Inclusions:
${(product.inclusions ?? []).join(", ")}

Featured:
${product.featured ? "Yes" : "No"}

Rating:
${product.rating ?? 0}

Reviews:
${product.reviewCount ?? 0}
          `.trim(),

          metadata: {
            collection: "products",
            id: product._id.toString(),
            category: product.categoryName,
            categoryId: product.categoryId?.toString(),
            price: product.price,
            featured: product.featured,
            active: product.active,
          },
        })
      );
    }

    // ===========================
    // Categories
    // ===========================

    for (const category of categories) {
      documents.push(
        new Document({
          pageContent: `
Category: ${category.name}

Slug:
${category.slug ?? ""}

Products:
${category.productCount ?? 0}

Subcategories:
${(category.subcategories ?? [])
  .map((sub: any) => sub.name ?? "")
  .join(", ")}
          `.trim(),

          metadata: {
            collection: "categories",
            id: category._id.toString(),
            slug: category.slug,
            active: category.active,
          },
        })
      );
    }

    // ===========================
    // Site Content
    // ===========================

    for (const page of siteContents) {
      documents.push(
        new Document({
          pageContent: `
Title:
${page.title}

Key:
${page.key}

Content:

${page.content}
          `.trim(),

          metadata: {
            collection: "sitecontent",
            id: page._id.toString(),
            key: page.key,
          },
        })
      );
    }

    // ===========================
    // Sliders
    // ===========================

    for (const slider of sliders) {
      documents.push(
        new Document({
          pageContent: `
Headline:
${slider.headline}

Subtext:
${slider.subtext ?? ""}

CTA:
${slider.ctaText}

Active:
${slider.active ? "Yes" : "No"}
          `.trim(),

          metadata: {
            collection: "sliders",
            id: slider._id.toString(),
            order: slider.order,
            active: slider.active,
          },
        })
      );
    }

    console.log(`✅ Loaded ${documents.length} AI documents`);

    return documents;
  }
}

export const mongoLoader = new MongoLoader();