-- Initial site content: everything the repo shipped with (src/data/*), written
-- through publish_site_content so it lands exactly as a dashboard publish would
-- (revision 1). Runs only on an empty database, so re-running is a no-op.
-- Replace or delete these records from /dashboard over time.
do $seed_block$
begin
  if exists (select 1 from public.site_settings) then
    raise notice $$site_settings already populated - seed skipped$$;
    return;
  end if;

  perform public.publish_site_content($seed_json$
{
  "settings": {
    "brand_name": "Riflesso Studio",
    "logo_url": "/riflesso.png",
    "logo_alt": "Riflesso",
    "meta_title": "Riflesso",
    "meta_description": "Riflesso represents hair, makeup, styling, grooming and manicure artists across the US and UK.",
    "copyright": "Riflesso Studio ©2026",
    "about_paragraphs": [
      "Riflesso Studio is a creative production house and artist management company working across fashion, beauty and portraiture. From studios in Ho Chi Minh City and Hanoi, our team represents photographers, stylists, hairstylists, makeup artists and set designers, and produces the editorial, campaign and runway work they are commissioned for. Services spanning casting, production, post and brand consulting let us carry a shoot from the first reference through to the printed page.",
      "The studio takes its name from the Italian for reflection. Every commission starts with the same question — what is this image reflecting back? We build our work around long collaborations with a small roster of artists, and we invest in the next generation of Vietnamese talent through assisting placements, mentorship and open studio days."
    ],
    "social_links": [
      {
        "label": "Instagram",
        "url": "https://www.instagram.com/riflesso.studio"
      },
      {
        "label": "TikTok",
        "url": "https://www.tiktok.com/@riflesso.studio"
      }
    ]
  },
  "contacts": [
    {
      "id": "73074464-b551-5750-9dbe-ec836dfe4754",
      "heading": "Ho Chi Minh City",
      "address_lines": [
        "42 Nguyen Hue Boulevard, District 1",
        "Ho Chi Minh City"
      ],
      "phone": "Tel +84 (28) 3822 4477",
      "lead": "",
      "email": "hello@riflesso.studio",
      "link_label": "",
      "link_url": "",
      "contact_only": false
    },
    {
      "id": "8a252bd2-719e-5299-9d49-939f6d3840cc",
      "heading": "Hanoi",
      "address_lines": [
        "18 Ly Thuong Kiet, Hoan Kiem District",
        "Hanoi"
      ],
      "phone": "Tel +84 (24) 3936 5510",
      "lead": "",
      "email": "hanoi@riflesso.studio",
      "link_label": "",
      "link_url": "",
      "contact_only": false
    },
    {
      "id": "3e77f87a-1184-52a6-8549-25c50f1efcc3",
      "heading": "Bookings",
      "address_lines": [],
      "phone": "",
      "lead": "For editorial, campaign and runway bookings please contact",
      "email": "bookings@riflesso.studio",
      "link_label": "",
      "link_url": "",
      "contact_only": false
    },
    {
      "id": "7ae11b0c-542c-59c3-a85f-e742e6d95bfe",
      "heading": "Careers",
      "address_lines": [],
      "phone": "",
      "lead": "",
      "email": "careers@riflesso.studio",
      "link_label": "",
      "link_url": "",
      "contact_only": false
    },
    {
      "id": "b3376c30-1c52-5d7c-8145-55e7d0637d91",
      "heading": "New Business Inquiries",
      "address_lines": [],
      "phone": "",
      "lead": "",
      "email": "newbusiness@riflesso.studio",
      "link_label": "",
      "link_url": "",
      "contact_only": false
    },
    {
      "id": "97859046-42bf-5ff7-928e-c5168a473530",
      "heading": "Brand Partnerships",
      "address_lines": [],
      "phone": "",
      "lead": "",
      "email": "partnerships@riflesso.studio",
      "link_label": "",
      "link_url": "",
      "contact_only": true
    },
    {
      "id": "9deeea64-836c-5866-b9f1-1344a78c176f",
      "heading": "Press",
      "address_lines": [],
      "phone": "",
      "lead": "For press requests and image licensing please contact",
      "email": "press@riflesso.studio",
      "link_label": "",
      "link_url": "",
      "contact_only": false
    },
    {
      "id": "3b638cf8-c68e-5e09-a809-1b12e66190fb",
      "heading": "Studio Rental",
      "address_lines": [],
      "phone": "",
      "lead": "For availability at our Ho Chi Minh City studio please contact",
      "email": "studio@riflesso.studio",
      "link_label": "",
      "link_url": "",
      "contact_only": false
    },
    {
      "id": "26baf62c-746a-5955-9be5-1b2d05773339",
      "heading": "Representation",
      "address_lines": [],
      "phone": "",
      "lead": "",
      "email": "",
      "link_label": "Submit your Portfolio Here",
      "link_url": "#",
      "contact_only": false
    }
  ],
  "cats": [
    {
      "id": "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835",
      "name": "Styling",
      "is_visible": true
    },
    {
      "id": "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
      "name": "Hair",
      "is_visible": true
    },
    {
      "id": "6398c3ec-cd9f-5c72-be65-cb8e69cb5079",
      "name": "Makeup",
      "is_visible": true
    },
    {
      "id": "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc",
      "name": "Grooming",
      "is_visible": true
    },
    {
      "id": "a6beb326-6c90-5a54-8f39-336873ba5699",
      "name": "Color",
      "is_visible": true
    },
    {
      "id": "a8f88c60-51e9-5633-9c56-9fa8d73a4710",
      "name": "Manicure",
      "is_visible": true
    },
    {
      "id": "3fa174e8-8952-5a3b-ad01-f9f58fbbba0c",
      "name": "Creative Direction",
      "is_visible": true
    },
    {
      "id": "3ca10511-e7b4-5be3-8ae1-41a668d82970",
      "name": "Digital Creators",
      "is_visible": true
    },
    {
      "id": "8ebdff47-2640-5974-a343-93410509eb99",
      "name": "Set Design",
      "is_visible": true
    },
    {
      "id": "e0eda493-3e46-5676-ae6c-750fa854b75e",
      "name": "Special Bookings",
      "is_visible": true
    },
    {
      "id": "bed00b6a-3e40-5897-aa4e-5ad3ade996ae",
      "name": "Development",
      "is_visible": true
    },
    {
      "id": "f1c2185f-6406-5a97-8bc0-ed41569f3781",
      "name": "Photography",
      "is_visible": false
    },
    {
      "id": "0da4c01a-9632-5747-87e4-369c626b0336",
      "name": "Props",
      "is_visible": false
    },
    {
      "id": "d6c07558-005d-5f7c-b0f0-eef83c82375f",
      "name": "Muse",
      "is_visible": false
    },
    {
      "id": "11c89d28-a322-597b-84ab-d874d56031c0",
      "name": "Lighting",
      "is_visible": false
    }
  ],
  "artists": [
    {
      "id": "3a3ff35e-47d0-5056-bb75-32ebc31809be",
      "name": "Aika Flores",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/b64a6cae-fa34-4b50-9058-adad1df8b50e/20260708_HWILLIAMS_BALENCIAGA_AFL_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "ce1367f8-53e4-5108-9ce2-d1dfbe2c74e3",
      "name": "Alexa Hernandez",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/31a1dbd8-a144-44ce-a1b1-224cd3d6bf10/20260624_IAPATOW_DIOR_ACA_MPO_02?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079",
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "6ae01781-5365-50cd-bf39-1764bb519694",
      "name": "Alice Moore",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/07/202406_HOLLYWOODREPORTER_GAROCH_ALM_MFR_12.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "b9ac87bc-987d-5a88-8c35-225b9103631d",
      "name": "Amy Komorowski",
      "territory_code": "US",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "30593cc9-2c9d-501c-a886-46e7f368b209",
      "name": "Ana Tess",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/06/202411_WHATEVR_BMARION_ATS_07-scaled.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "a3ad489d-a936-55c7-a7d3-5c36ebfdda7a",
      "name": "Andy Lecompte",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/a25490b1-4dcd-4a99-bb45-d42158791076/202608_VOGUECZ_AJABIEV_ALT_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "86468983-7e2f-5b59-ad6a-a722897429b0",
      "name": "Anne Sophie Costa",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/d1edf677-a7b9-48b2-b8b9-52dbcbb6e2d0/202703_Y3_RUNWAY_ACA_27?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "d3bca8fe-ff56-518b-8de0-276c6d16132d",
      "name": "Austen Turner",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/04/202507_FLAUNT_MSELIGER_ATN_MAS_08-scaled.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "5cb5094e-7ce5-52cf-9f13-1a8e9cd6f7ca",
      "name": "Avo Yermagyan",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/abb5f99c-3cd5-4412-8a95-eb8b9354c104/202607_IMAGINE_TNEVITT_AVO_05?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "5af3173f-ed0e-5e46-ba92-8fa31e5c5768",
      "name": "Aya Tariq",
      "territory_code": "US",
      "portrait_url": "/assets/artist-1.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "ce9d6b62-4a8c-568d-995a-df5b8c75512a",
      "name": "Benjamin Puckey",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/e20814c8-48eb-4f86-95ed-cde877ed6d8a/202506_LOVEWANT_ASERGE_BPY_03?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "7adf0782-2127-53b0-b354-fa5c197cb3f4",
      "name": "Bincio",
      "territory_code": "US",
      "portrait_url": "/assets/stories/gilded-frame-01.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "f1c2185f-6406-5a97-8bc0-ed41569f3781"
      ]
    },
    {
      "id": "04a20d06-0177-50c4-aa21-3e782cdee56e",
      "name": "Bjorn Krischker",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/406c4041-48fa-4d45-bb54-a9a5b92f019a/202607_DLAREPUBBLICA_UKNOBLAUCH_BKR_CPL_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "d4ee19b3-e83b-5a3e-bce9-860184781987",
      "name": "Brandon Tan",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/93b6ecf1-1836-4403-b1a8-4ad17bdbbada/202504_COSMOPOLITAN_EJOHNSON_BTN_07?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "86fc4173-e063-5fd3-a0f8-6fcd3f2e05b8",
      "name": "Brooke Turnbull",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/f400964e-8d76-45c1-8016-523110b79d6d/20260623_CHARLIXCX_SAINTLAURENT_BTL_CHH_04?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "58be5acc-69f0-5722-bce5-28542ab0ad9c",
      "name": "Caroline Cotten",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/3e904db3-681f-494c-8287-ddf5a074ee7c/202606_MAC_INEZVINOODH_CCN_05?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "a8f88c60-51e9-5633-9c56-9fa8d73a4710"
      ]
    },
    {
      "id": "900d574c-ab6a-5745-a8e1-ebdbdb26c02f",
      "name": "Cathy Tran",
      "territory_code": "US",
      "portrait_url": "/assets/stories/traces-02.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "0da4c01a-9632-5747-87e4-369c626b0336"
      ]
    },
    {
      "id": "e5e422ff-cc3e-53c0-a118-b5ff917d31b5",
      "name": "Charlie Riddle",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/fd1952b0-2f0c-4b20-af13-4190e99c1325/202608_ESQUIRESG_JKOCKA_CRE_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "d080dc21-49e5-5b7d-a4fe-cdb20e08dba2",
      "name": "Charlotte Prevel",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/406c4041-48fa-4d45-bb54-a9a5b92f019a/202607_DLAREPUBBLICA_UKNOBLAUCH_BKR_CPL_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "e5c8ddc4-186d-5818-820d-f8e66d41ddb4",
      "name": "Chelsea Zalopany",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/06/202604_HOMMEGIRLS_CVALDEZ_CZY_08-scaled.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "b2de2b2e-0275-56d7-b86b-eac24876e502",
      "name": "Chris Horan",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/f400964e-8d76-45c1-8016-523110b79d6d/20260623_CHARLIXCX_SAINTLAURENT_BTL_CHH_04?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "3897a031-6cc1-5988-8b5b-0f5ee0621257",
      "name": "Diana Berry",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/07/202606_GAP_RCLEMENTS_DBY_KKS_12.jpeg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "70749d41-807d-5259-ab5d-0f3b1e1d7f10",
      "name": "Diego Nguyen",
      "territory_code": "US",
      "portrait_url": "/assets/stories/traces-02.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "ba0eb374-1ff2-5962-94db-3ef49eff5900",
      "name": "Dinh Tran",
      "territory_code": "US",
      "portrait_url": "/assets/stories/setting-curls-01.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "d7e231d7-8c1b-5e24-b2b0-f82c1ccd3987",
      "name": "Emma Day",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/aeb1dd56-a3a4-4b8a-86b7-673492a3e0ac/202605_BULGARI_DBAKER_EDY_HBR_05?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079",
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "5fe79868-5442-54e4-9393-afca8f70b5ca",
      "name": "Emma Jade Morrison",
      "territory_code": "EUROPE",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "7ac9254c-5f2e-506d-be0c-b38f2473cf73",
      "name": "Fabio Petri",
      "territory_code": "EUROPE",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "64402ee0-876c-5f0c-a532-da1ebef6afe4",
      "name": "Frank B",
      "territory_code": "US",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "34d484e6-1af3-5d77-b3d0-99a1cdbecee7",
      "name": "Georgie Eisdell",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/46f7dd81-7a9c-495c-89c0-0d9e7a24e16a/202609_ELLEUK_YGORBACHENKO_GE_GR_04?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "8ed5e960-8d59-5f06-a244-1ebe5a9f6e89",
      "name": "Gregory Russell",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/46f7dd81-7a9c-495c-89c0-0d9e7a24e16a/202609_ELLEUK_YGORBACHENKO_GE_GR_04?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "9c9b276f-0b7d-5ec4-a3cb-a6d425d450c8",
      "name": "Gucci Westman",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/aabe38ac-4af9-4879-b1c3-09194371b585/202604_CHANEL_CMCDEAN_GWN_02?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "147ed3f2-bd8d-5552-8db5-885f988c3d25",
      "name": "Halley Brisker",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/aeb1dd56-a3a4-4b8a-86b7-673492a3e0ac/202605_BULGARI_DBAKER_EDY_HBR_05?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "5e5ec0de-8d99-54e1-8113-828bddc05ee4",
      "name": "Harold James",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/b03f8c01-cc7b-44a4-b5cc-695a895a5059/20260707_LHARRIER_ARMANI_HJS_JYZ_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "4f9e8e4b-9f16-5715-a452-cbf09759074c",
      "name": "Hos",
      "territory_code": "EUROPE",
      "portrait_url": "/assets/artist-4.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "3786f5af-ca12-5b52-b5db-8b6da3f6735b",
      "name": "Ilham Mestour",
      "territory_code": "EUROPE",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "00cf186d-17d2-5041-b4ab-38395fb711f8",
      "name": "Issac Poleon",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/4b3f6809-2ccb-4566-b3a0-0b4044098058/202608_VOGUEUK_NIJEWERE_IPN_04?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "efb09fe0-74dd-5929-a501-2a3055496bb0",
      "name": "Iván Gómez",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/07/20260707_LPASCAL_CHANEL_MMC_IGZ_01-683x1024.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "8428cdf2-0ccd-5fb0-92c9-a84deaf8274f",
      "name": "James Yardley",
      "territory_code": "EUROPE",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "b887aa93-e37c-5c38-914f-9ff2b4450915",
      "name": "Jay Hines",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/98bd30f8-6e32-4212-a1b7-65a5a7192aaf/202306_SHARP_CGRAY_JHS_04?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "13cd0252-db30-598d-9b79-f0a415ff666e",
      "name": "Jennifer Yepez",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/b03f8c01-cc7b-44a4-b5cc-695a895a5059/20260707_LHARRIER_ARMANI_HJS_JYZ_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "360a599e-6c50-578a-b864-ba43f66515e6",
      "name": "Jillian Dempsey",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/8a4fcfb5-82bf-4cce-b491-3c9754eb1456/202102_VANITYFAIRFR_CBUCHANAN_JDY_09?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079",
        "3ca10511-e7b4-5be3-8ae1-41a668d82970"
      ]
    },
    {
      "id": "c8b03f89-46d8-5ace-9f0e-054266892404",
      "name": "Jillian Halouska",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/81f2a622-87fd-486e-8453-c1204ec08088/202605_RHODE_JMARQUES_JHA_MMI_11?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "325f8ad8-ca49-5870-be81-532868dbec0e",
      "name": "Joey Choy",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/03647a18-5d98-4cc0-848f-59f32ab38624/20260623_LMOSS_SAINTLAURENT_JCY_02?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "cb182da2-7e2c-51ec-a0da-94ed1d36ad5c",
      "name": "Kate Young",
      "territory_code": "US",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835",
        "3ca10511-e7b4-5be3-8ae1-41a668d82970"
      ]
    },
    {
      "id": "54908701-2b91-523d-a47f-3e9e67db79da",
      "name": "Katie Qian",
      "territory_code": "US",
      "portrait_url": "/assets/artist-3.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "245ae15b-1c36-5cfb-ba61-a61d8b16a3a8",
      "name": "Kendra Alia",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/05/202602_MIUMIU_UNKNOWN_KAA_01.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
        "a6beb326-6c90-5a54-8f39-336873ba5699",
        "3ca10511-e7b4-5be3-8ae1-41a668d82970"
      ]
    },
    {
      "id": "3efa9d4b-13bd-51a3-8b04-fd9e72802e89",
      "name": "Kimmie Kyees",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/07/202606_GAP_RCLEMENTS_DBY_KKS_12.jpeg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "a8f88c60-51e9-5633-9c56-9fa8d73a4710"
      ]
    },
    {
      "id": "15e10afd-8b06-55b7-b196-3c8a483e9897",
      "name": "Kirsty Stewart",
      "territory_code": "EUROPE",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "525eb458-de91-59f1-b709-1701fd8c9a3a",
      "name": "Leith Clark",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/9289a66e-a13d-4010-950b-cbc27c4217ef/20260626_LBOYNTON_GIORGIOARMANI_LCK_03?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "0caa9fd1-4e87-5038-8974-de58b1ad50ff",
      "name": "Lisa Aharon",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/0e934275-8e65-4388-b84a-9efb06d32953/202607_FLAUNT_JCHOH_LAH_10?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "447c1b66-c772-5fb5-bdb9-e8eed28f6fba",
      "name": "Liz Taw",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/7c16ce70-11a8-4422-8e4b-e090bcdbc375/202606_JOMALONE_TCOULSON_LTW_05?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "64f12e79-c672-5ab0-abd0-86d5dd4439e8",
      "name": "Martin Cullen",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/75fbef1e-dedb-4a5a-95f3-c5fb15acb968/202703_MAISONMIHARAYASUHIRO_RUNWAY_MCN_75?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "ae838522-7c0f-5d35-82fb-2b54c533378f",
      "name": "Marty Harper",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/0e1073a7-2869-4f27-8386-d468afcfe73b/202606_VOGUEUK_SARRIAGADA_MHR_08?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
        "3ca10511-e7b4-5be3-8ae1-41a668d82970"
      ]
    },
    {
      "id": "d4eb050f-5067-526a-bc1e-add793acbec5",
      "name": "María Pélo",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/31a1dbd8-a144-44ce-a1b1-224cd3d6bf10/20260624_IAPATOW_DIOR_ACA_MPO_02?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "80df9089-0cdb-5f8f-8176-aae578761f79",
      "name": "May Truong",
      "territory_code": "US",
      "portrait_url": "/assets/stories/setting-curls-01.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "bb026143-b9c5-51f4-a7f1-64554d93791a",
      "name": "Michael Fisher",
      "territory_code": "US",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "f5eb38e0-e0d6-5782-ad6b-25e56c04b7a0",
      "name": "Mimi Cuttrell",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/07/20260707_LPASCAL_CHANEL_MMC_IGZ_01-683x1024.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835",
        "3ca10511-e7b4-5be3-8ae1-41a668d82970"
      ]
    },
    {
      "id": "c8fe8212-7d45-5439-b579-c21f84400d67",
      "name": "Mona Leanne",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/07/20260706_SWILDE_DIOR_MLE_RMI_01-1-768x1024.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079",
        "3ca10511-e7b4-5be3-8ae1-41a668d82970"
      ]
    },
    {
      "id": "5cfe532b-8add-508a-b433-be3aabdcb9f8",
      "name": "Morgane Martini",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/81f2a622-87fd-486e-8453-c1204ec08088/202605_RHODE_JMARQUES_JHA_MMI_11?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "b2be62df-97d0-5af2-b101-fd4a56d9cf8d",
      "name": "Nguyen Tan Thanh",
      "territory_code": "US",
      "portrait_url": "/assets/stories/gilded-frame-01.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "9d5da509-9264-5fdb-91f8-81d4cfc7d27b",
      "name": "Peter Lux",
      "territory_code": "US",
      "portrait_url": "",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "609c9774-2853-5899-8199-344b0370f46b",
      "name": "Philipp Verheyen",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/26bd9cbd-0860-4986-b7fc-d0f53a86d993/20260623_ESAKRAYA_LOUISVUITTON_PVN_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "6c84799c-88b1-55d8-a9fa-17335f5de752",
      "name": "Ricky Fraser",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/29bee630-bf4d-4415-9acb-01ea288c3d9a/202606_V_INEZVINOODH_RFR_02?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "c48109a9-5faf-5044-9921-a24c79218cd0",
      "name": "Romane Martini",
      "territory_code": "EUROPE",
      "portrait_url": "/assets/artist-1.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "a8f88c60-51e9-5633-9c56-9fa8d73a4710"
      ]
    },
    {
      "id": "68e2beee-136f-5861-895a-5600a657fcec",
      "name": "Rose Forde",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/bef4ab12-7c17-4225-aa28-81c5b5d7647d/20260624_CEJIOFOR_DIOR_RFE_02?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "f5a9973c-4ef6-536b-9d96-f96c0d07a3e8",
      "name": "Rudy Martins",
      "territory_code": "US",
      "portrait_url": "/assets/artist-2.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "5392d859-4025-58d5-8c83-37d6946ad47a",
      "name": "Samantha McMillen",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/eba3210c-800a-48b1-965c-4be32094645f/20260623_CMELTON_LOUISVUITTON_SM_03?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "8041faf1-e2b1-5140-b14e-109241874bad",
      "name": "Sasha Nesterchuk",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/06/202511_DOUBLEVISION_LUIGIIANGO_SNK_06.jpeg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "28116cec-bd7e-5b49-9521-b8e2e909be11",
      "name": "Shameelah Hicks",
      "territory_code": "US",
      "portrait_url": "/assets/artist-4.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "9cc3c8b0-6506-5cc2-a2e9-f3ff8f14f835"
      ]
    },
    {
      "id": "2355f8ce-1df9-5771-b18c-ca344da1d74b",
      "name": "Shayna Goldberg",
      "territory_code": "US",
      "portrait_url": "https://thewallgroup.bynder.com/transform/08b420f2-f3d5-4051-81ee-8238b1638b13/202603_METAL_CMOORE_SGG_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "190acd1a-02bf-5663-afd4-7c258c8f61e3",
      "name": "Shishi",
      "territory_code": "US",
      "portrait_url": "/assets/stories/traces-02.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "d646b679-6e02-5da4-9099-8aaab5112bb8",
      "name": "Sky Cripps-Jackson",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/2accc369-7d58-4c30-ac78-3d3d1d297924/20260623_LYOUNG_LOUISVUITTON_SCJ_01?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88",
        "3af0f92e-a2f9-5f6c-8f6c-974a5dfb8edc"
      ]
    },
    {
      "id": "8ab1534f-7212-587f-bc36-3a4cbae60367",
      "name": "Sophia Sinot",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.bynder.com/transform/ff772dc2-f768-4581-a38b-662465df69f6/202606_DESIGUAL_CRUTHERFORD_SST_08?quality=85",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "9a828493-93c3-51f4-a44d-ebeec9b41892",
      "name": "Takuya Yamaguchi",
      "territory_code": "EUROPE",
      "portrait_url": "/assets/artist-1.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "7c1bc68e-c583-55b0-b427-0f8a57c7ea88"
      ]
    },
    {
      "id": "845a3eb5-2da8-5dd8-b6c8-a3945e9145cc",
      "name": "Thuy Anh",
      "territory_code": "US",
      "portrait_url": "/assets/stories/thuy-anh-01.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "d6c07558-005d-5f7c-b0f0-eef83c82375f"
      ]
    },
    {
      "id": "30b6610b-13ed-50de-8b77-f10d6bb31e37",
      "name": "Victor Chau",
      "territory_code": "US",
      "portrait_url": "/assets/stories/traces-02.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "11c89d28-a322-597b-84ab-d874d56031c0"
      ]
    },
    {
      "id": "b1414fad-6557-5441-8da8-b4569a674217",
      "name": "Yacine Diallo",
      "territory_code": "EUROPE",
      "portrait_url": "https://thewallgroup.com/wp-content/uploads/2026/07/20260708_GIVEON_BALENCIAGA_YDO_01-768x1024.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "6398c3ec-cd9f-5c72-be65-cb8e69cb5079"
      ]
    },
    {
      "id": "84662b88-3854-5f44-a964-2b733ec2decc",
      "name": "Zola Ganzorigt",
      "territory_code": "US",
      "portrait_url": "/assets/artist-2.jpg",
      "portrait_position": "50% 18%",
      "bio": "",
      "is_published": true,
      "category_ids": [
        "a8f88c60-51e9-5633-9c56-9fa8d73a4710",
        "3ca10511-e7b4-5be3-8ae1-41a668d82970"
      ]
    }
  ],
  "albums": [
    {
      "id": "ae6a4918-6b51-51a9-8ea7-ec016b16fdde",
      "title": "The Gilded Frame",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/stories/gilded-frame-01.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/gilded-frame-02.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/gilded-frame-03.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/gilded-frame-04.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/gilded-frame-05.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/gilded-frame-06.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Bincio",
          "role": "Photography"
        },
        {
          "name": "Nguyen Tan Thanh",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "b3d979bf-6b1d-5e9d-a99c-9d6e5fd40f44",
      "title": "Setting Curls",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/stories/setting-curls-01.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/setting-curls-02.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/setting-curls-03.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/setting-curls-04.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/setting-curls-05.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/setting-curls-06.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/setting-curls-07.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "May Truong",
          "role": "Hair"
        },
        {
          "name": "Dinh Tran",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "05728b39-7983-55d0-a45f-af47f95b04d2",
      "title": "Traces of Memories",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/stories/traces-02.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/traces-03.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/traces-01.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Bincio",
          "role": "Photography"
        },
        {
          "name": "Diego Nguyen",
          "role": "Makeup"
        },
        {
          "name": "Shishi",
          "role": "Hair"
        },
        {
          "name": "Nguyen Tan Thanh",
          "role": "Styling"
        },
        {
          "name": "Victor Chau",
          "role": "Lighting"
        },
        {
          "name": "Cathy Tran",
          "role": "Props"
        }
      ]
    },
    {
      "id": "0eacacae-f672-5a2e-aa7c-559f6607633d",
      "title": "Elle Vietnam",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/stories/elle-01.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-02.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-03.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-04.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-05.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-06.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-07.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-08.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-09.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/elle-10.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Bincio",
          "role": "Creative Direction, Photography"
        },
        {
          "name": "Nguyen Tan Thanh",
          "role": "Styling"
        },
        {
          "name": "Dinh Tran",
          "role": "Makeup"
        },
        {
          "name": "May Truong",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "7df7b959-e1b7-5965-9b12-82ede5c12f02",
      "title": "The Soulful Splendor",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/stories/thuy-anh-01.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/thuy-anh-02.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/thuy-anh-03.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/thuy-anh-04.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/thuy-anh-05.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Thuy Anh",
          "role": "Muse"
        },
        {
          "name": "Bincio",
          "role": "Photography"
        },
        {
          "name": "Nguyen Tan Thanh",
          "role": "Styling"
        },
        {
          "name": "Dinh Tran",
          "role": "Makeup"
        },
        {
          "name": "May Truong",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "bd43ca6f-31dc-5914-9e40-5a9364bc40c6",
      "title": "Đẹp Magazine",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/stories/dep-01.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/dep-02.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Bincio",
          "role": "Photography"
        },
        {
          "name": "Dinh Tran",
          "role": "Makeup"
        },
        {
          "name": "May Truong",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "f0e3c488-3974-53d2-bb0f-c13d35faf1e6",
      "title": "Riflesso Studio",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/hero-frame.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Diego Nguyen",
          "role": "Makeup"
        },
        {
          "name": "Shishi",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "220848c1-042f-5062-9a4b-6b2de1630a51",
      "title": "Glamour UK",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/artist-1.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Takuya Yamaguchi",
          "role": "Hair"
        },
        {
          "name": "Aya Tariq",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "1dc0b0a8-0bb3-570a-8af1-1f44d6d1c2d5",
      "title": "Perfect",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/artist-2.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Zola Ganzorigt",
          "role": "Manicure, Digital Creators"
        }
      ]
    },
    {
      "id": "459f53c1-ffd7-5ce8-bb2a-a9dc03edefa0",
      "title": "Nylon",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/artist-3.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Katie Qian",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "321ac5dc-e586-5d87-88d2-23b9966b1d01",
      "title": "D La Repubblica Magazine",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/406c4041-48fa-4d45-bb54-a9a5b92f019a/202607_DLAREPUBBLICA_UKNOBLAUCH_BKR_CPL_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Charlotte Prevel",
          "role": "Makeup"
        },
        {
          "name": "Bjorn Krischker",
          "role": "Hair, Grooming"
        }
      ]
    },
    {
      "id": "f8c77fbe-fb83-5e0e-8db3-4fad7b7a7ff9",
      "title": "Elle UK",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/46f7dd81-7a9c-495c-89c0-0d9e7a24e16a/202609_ELLEUK_YGORBACHENKO_GE_GR_04?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Georgie Eisdell",
          "role": "Makeup"
        },
        {
          "name": "Gregory Russell",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "f1af1744-4087-55b0-b95c-a8bce0b62d4d",
      "title": "Esquire Singapore",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/fd1952b0-2f0c-4b20-af13-4190e99c1325/202608_ESQUIRESG_JKOCKA_CRE_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Charlie Riddle",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "cff5aad7-15ca-562b-adcc-70e745c0d0b1",
      "title": "Metal",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/08b420f2-f3d5-4051-81ee-8238b1638b13/202603_METAL_CMOORE_SGG_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Shayna Goldberg",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "90609126-44ee-5417-a2fd-fa16ddc09c2e",
      "title": "Vogue UK",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/4b3f6809-2ccb-4566-b3a0-0b4044098058/202608_VOGUEUK_NIJEWERE_IPN_04?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Issac Poleon",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "0c5b0947-3ad1-5255-985f-256db5d30b26",
      "title": "Flaunt",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/0e934275-8e65-4388-b84a-9efb06d32953/202607_FLAUNT_JCHOH_LAH_10?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Lisa Aharon",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "f9bd9231-cdd3-5344-954b-486392bcc0a1",
      "title": "Imagine Magazine",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/abb5f99c-3cd5-4412-8a95-eb8b9354c104/202607_IMAGINE_TNEVITT_AVO_05?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Avo Yermagyan",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "cc91e112-fdf3-5dda-8024-11f7933b0d1a",
      "title": "Vogue UK",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/0e1073a7-2869-4f27-8386-d468afcfe73b/202606_VOGUEUK_SARRIAGADA_MHR_08?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Marty Harper",
          "role": "Hair, Digital Creators"
        }
      ]
    },
    {
      "id": "9f07b24b-221a-5549-8051-d2087088313d",
      "title": "Vogue Czechoslovakia",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/a25490b1-4dcd-4a99-bb45-d42158791076/202608_VOGUECZ_AJABIEV_ALT_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Andy Lecompte",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "db149bc8-ea08-5b52-944c-fc57f7c71d8f",
      "title": "HommeGirls",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/06/202604_HOMMEGIRLS_CVALDEZ_CZY_08-scaled.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Chelsea Zalopany",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "da11ca4f-25f0-5b94-adae-fa52965d07f2",
      "title": "Vogue France",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/asset/19162fb7-264b-4d34-b25a-2a2bff83ad89/mp4/202606_VOGUEFR_APENNETTA_MMI_11.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Morgane Martini",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "195c967d-7132-59ed-8f59-42e48b527fb3",
      "title": "V Magazine",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/29bee630-bf4d-4415-9acb-01ea288c3d9a/202606_V_INEZVINOODH_RFR_02?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Ricky Fraser",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "1d0ad182-2be0-55bb-b223-d4462e91b450",
      "title": "Interview",
      "kind": "Editorial",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/3e7f2b3d-8baa-40fb-afce-c2d02ef0c407/202604_INTERVIEW_TLIU_ZLA_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Zola Ganzorigt",
          "role": "Manicure, Digital Creators"
        }
      ]
    },
    {
      "id": "5926b353-3672-5a72-a9c1-025e0f388130",
      "title": "Art 02",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/stories/art-02-01.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-02.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-03.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-04.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-05.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-06.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-07.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-08.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-09.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-10.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-11.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-12.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-13.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-14.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-15.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-16.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-17.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-18.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-19.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-20.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-21.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-22.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        },
        {
          "url": "/assets/stories/art-02-23.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Bincio",
          "role": "Photography"
        },
        {
          "name": "Nguyen Tan Thanh",
          "role": "Styling"
        },
        {
          "name": "Dinh Tran",
          "role": "Makeup"
        },
        {
          "name": "Shishi",
          "role": "Hair"
        },
        {
          "name": "May Truong",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "97be85be-977a-54f8-af44-b70fcc1ef324",
      "title": "Elle × Porsche",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/elle-porsche.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Nguyen Tan Thanh",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "dbbd61cb-b740-52f5-91b9-b8e64d17e162",
      "title": "Vix",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/06/edit-2C1986D7-34CE-4B09-A00FA9ECDE71899A.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Peter Lux",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "42ac4063-62cb-5e67-8d57-387436dd70ef",
      "title": "RHODE",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/81f2a622-87fd-486e-8453-c1204ec08088/202605_RHODE_JMARQUES_JHA_MMI_11?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Jillian Halouska",
          "role": "Hair"
        },
        {
          "name": "Morgane Martini",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "a711de51-21e4-52d1-a1f1-ff15f019cbc5",
      "title": "Quince",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/asset/8e711c36-6de0-4f7b-b65f-6dc99928e39e/202606_QUINCE_SONEILL_KY_43.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Kate Young",
          "role": "Styling, Digital Creators"
        }
      ]
    },
    {
      "id": "6fe867b0-511a-5e72-ba72-7ff4145c9461",
      "title": "Gap",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/07/202606_GAP_RCLEMENTS_DBY_KKS_12.jpeg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Diana Berry",
          "role": "Makeup"
        },
        {
          "name": "Kimmie Kyees",
          "role": "Manicure"
        }
      ]
    },
    {
      "id": "08a978ac-60ab-5f95-990a-81f2f4c43974",
      "title": "Bulgari",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/asset/9bf08733-c29a-4795-9fa7-be2afe231c15/mp4/202603_BULGARI_GWILLIAMS_ALM_MFR_09.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Michael Fisher",
          "role": "Styling"
        },
        {
          "name": "Alice Moore",
          "role": "Grooming"
        }
      ]
    },
    {
      "id": "6d0b1dcc-db0e-513b-8f8f-dfa03de91a98",
      "title": "Bulgari",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/aeb1dd56-a3a4-4b8a-86b7-673492a3e0ac/202605_BULGARI_DBAKER_EDY_HBR_05?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Emma Day",
          "role": "Makeup, Grooming"
        },
        {
          "name": "Halley Brisker",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "f2dc3666-940b-5552-b12a-a4b57eb7ae8a",
      "title": "Dior",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/06/202605_DIOR_POSTERNAKS_JHA_27.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Jillian Halouska",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "fa7b9500-5c7a-572f-871f-e033a9a0a0a1",
      "title": "Jo Malone",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/7c16ce70-11a8-4422-8e4b-e090bcdbc375/202606_JOMALONE_TCOULSON_LTW_05?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Liz Taw",
          "role": "Hair, Grooming"
        }
      ]
    },
    {
      "id": "4e395143-a5a9-51fa-9df2-d20496e5a974",
      "title": "MAC Cosmetics",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/3e904db3-681f-494c-8287-ddf5a074ee7c/202606_MAC_INEZVINOODH_CCN_05?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Caroline Cotten",
          "role": "Manicure"
        }
      ]
    },
    {
      "id": "855cae2e-1d35-58e8-aa5f-9507c4558500",
      "title": "Milk Makeup",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/cropped-thumbs/202606_MILKMAKEUP_UNKNOWN_FB_01-cropped.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Frank B",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "24c109ff-4339-5837-bbfc-0c54e1428683",
      "title": "Desigual",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/ff772dc2-f768-4581-a38b-662465df69f6/202606_DESIGUAL_CRUTHERFORD_SST_08?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Sophia Sinot",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "7dc795e5-518b-5c0d-a140-f10b6f1dfb65",
      "title": "Savage x Fenty",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/cropped-thumbs/202604_SAVAGEXFENTY_LCHEMOTTI_AHZ_01-cropped.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Alexa Hernandez",
          "role": "Makeup, Grooming"
        }
      ]
    },
    {
      "id": "09151be8-9a09-551b-af31-be35e4fd0ba5",
      "title": "Tiffany & Co",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/asset/082c256e-9313-41d4-9d93-36d4d0291161/202604_TIFFANYCO_UNKNOWN_AKI_JYY_01.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "James Yardley",
          "role": "Styling"
        },
        {
          "name": "Amy Komorowski",
          "role": "Grooming"
        }
      ]
    },
    {
      "id": "b84f4e53-4e84-5ca4-bf44-81f9863dea44",
      "title": "Chanel",
      "kind": "Campaign",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/aabe38ac-4af9-4879-b1c3-09194371b585/202604_CHANEL_CMCDEAN_GWN_02?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Gucci Westman",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "4f1ce920-9709-5a94-8442-c6fbd3c3f8c6",
      "title": "Dior",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/artist-1.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Romane Martini",
          "role": "Manicure"
        }
      ]
    },
    {
      "id": "4b09dde4-384a-5ea4-8a79-d389c79a8f82",
      "title": "Balenciaga",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/artist-4.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Hos",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "3f15dd44-6613-5cd0-917b-9d5335123508",
      "title": "Chanel",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/07/edit-02D0298C-0984-475D-974DD2B1EB66D0CC.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Fabio Petri",
          "role": "Hair, Grooming"
        },
        {
          "name": "Charlotte Prevel",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "36cbe4fc-cebd-5015-8b4d-fbd7a3eebca1",
      "title": "Armani",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/b03f8c01-cc7b-44a4-b5cc-695a895a5059/20260707_LHARRIER_ARMANI_HJS_JYZ_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Harold James",
          "role": "Makeup"
        },
        {
          "name": "Jennifer Yepez",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "f6e2211c-7cb8-5a5a-ae36-856fed128449",
      "title": "Chanel",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/07/edit-823B0A40-5F81-4775-934D2D05547DF48B.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Emma Jade Morrison",
          "role": "Styling"
        },
        {
          "name": "Brooke Turnbull",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "0aae0d7f-f604-5ce8-a4dd-feb7c332260f",
      "title": "Dior",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/07/20260706_SWILDE_DIOR_MLE_RMI_01-1-768x1024.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Mona Leanne",
          "role": "Makeup, Digital Creators"
        },
        {
          "name": "Romane Martini",
          "role": "Manicure"
        }
      ]
    },
    {
      "id": "47fd86bb-a4d3-5ca7-a9bd-dd7a0282a036",
      "title": "Balenciaga",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/b64a6cae-fa34-4b50-9058-adad1df8b50e/20260708_HWILLIAMS_BALENCIAGA_AFL_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Aika Flores",
          "role": "Grooming"
        }
      ]
    },
    {
      "id": "67f04444-dd6b-5a8a-8c8b-8e5063ce449a",
      "title": "Jean Paul Gaultier",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/07/edit-C57B3B13-AF30-46F1-97BDD8F216B8CDBF.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Harold James",
          "role": "Makeup"
        },
        {
          "name": "Ilham Mestour",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "adcd8148-4699-5c38-a992-c1da200377dc",
      "title": "Chanel",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/07/20260707_LPASCAL_CHANEL_MMC_IGZ_01-683x1024.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Mimi Cuttrell",
          "role": "Styling, Digital Creators"
        },
        {
          "name": "Iván Gómez",
          "role": "Hair, Makeup"
        }
      ]
    },
    {
      "id": "d6f09bc5-5e84-5135-8747-467f31be5354",
      "title": "Balenciaga",
      "kind": "Couture",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/07/20260708_GIVEON_BALENCIAGA_YDO_01-768x1024.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Yacine Diallo",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "10d79bac-f8e3-5814-a4c2-003c8f461379",
      "title": "Maison Mihara Yasuhiro",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/75fbef1e-dedb-4a5a-95f3-c5fb15acb968/202703_MAISONMIHARAYASUHIRO_RUNWAY_MCN_75?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Martin Cullen",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "8aecbb3d-6cd8-5957-92c1-8471b6cc01ef",
      "title": "Louis Vuitton",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/eba3210c-800a-48b1-965c-4be32094645f/20260623_CMELTON_LOUISVUITTON_SM_03?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Samantha McMillen",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "2c613ac4-4479-502f-a387-dfb831bf4119",
      "title": "Yves Saint Laurent",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/f400964e-8d76-45c1-8016-523110b79d6d/20260623_CHARLIXCX_SAINTLAURENT_BTL_CHH_04?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Chris Horan",
          "role": "Styling"
        },
        {
          "name": "Brooke Turnbull",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "3f0517a6-38a8-55bd-9d7f-76cc0df3f82a",
      "title": "Y-3 SS27",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/d1edf677-a7b9-48b2-b8b9-52dbcbb6e2d0/202703_Y3_RUNWAY_ACA_27?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Anne Sophie Costa",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "d58fa986-62bf-5302-9141-cec580af56fc",
      "title": "Louis Vuitton",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/06/20260623_TWITHERS_LOUISVUITTON_LTW_01-768x1024.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Liz Taw",
          "role": "Hair, Grooming"
        }
      ]
    },
    {
      "id": "4cfcdfeb-c78e-5d98-b33a-fd7fda32ded5",
      "title": "Yves Saint Laurent",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/06/20260623_CTORRIE_SAINTLAURENT_JYY_05.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "James Yardley",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "2ab6f357-2598-56af-ad53-f3a34cb0b0ae",
      "title": "Yves Saint Laurent",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/03647a18-5d98-4cc0-848f-59f32ab38624/20260623_LMOSS_SAINTLAURENT_JCY_02?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Joey Choy",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "af1b0b89-b39b-5c74-b419-2295778b4cd3",
      "title": "Yves Saint Laurent",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/c5a88578-c2d0-4f02-a5bd-389a9ddfa94a/20260623_ABUTLER_SAINTLAURENT_JHA_01?io=transform:crop,height:1200,width:800,path:square&focuspoint=0.49,0.36",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Jillian Halouska",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "d6204ff6-05d2-5430-ae44-daee1893dfa8",
      "title": "Dior",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/bef4ab12-7c17-4225-aa28-81c5b5d7647d/20260624_CEJIOFOR_DIOR_RFE_02?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Rose Forde",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "e36449e6-06b0-5a5f-b4eb-b5d78ecbeef2",
      "title": "Dior",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/31a1dbd8-a144-44ce-a1b1-224cd3d6bf10/20260624_IAPATOW_DIOR_ACA_MPO_02?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "María Pélo",
          "role": "Hair"
        },
        {
          "name": "Anne Sophie Costa",
          "role": "Makeup"
        },
        {
          "name": "Alexa Hernandez",
          "role": "Grooming"
        }
      ]
    },
    {
      "id": "52e845be-9e66-5d7b-835b-9463f7cf62fa",
      "title": "Yves Saint Laurent",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/34459e74-3faa-4be2-8831-72d931800b82/20260623_JALWYN_SAINTLAURENT_RFE_05?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Rose Forde",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "0ade549a-9a7f-535c-b84c-aedd1cc3fa5b",
      "title": "Louis Vuitton",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/26bd9cbd-0860-4986-b7fc-d0f53a86d993/20260623_ESAKRAYA_LOUISVUITTON_PVN_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Philipp Verheyen",
          "role": "Hair, Makeup"
        }
      ]
    },
    {
      "id": "1fb70fc6-ac83-5f29-8064-b818d676eeb7",
      "title": "Louis Vuitton",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/2accc369-7d58-4c30-ac78-3d3d1d297924/20260623_LYOUNG_LOUISVUITTON_SCJ_01?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Sky Cripps-Jackson",
          "role": "Hair, Grooming"
        }
      ]
    },
    {
      "id": "d7b7d247-14d9-5ef2-9020-9740f12df147",
      "title": "Armani",
      "kind": "Fashion Week",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/9289a66e-a13d-4010-950b-cbc27c4217ef/20260626_LBOYNTON_GIORGIOARMANI_LCK_03?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Leith Clark",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "f4c9cd64-6f0c-56a6-a9fe-70106064a313",
      "title": "Thuy Anh — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/stories/thuy-anh-05.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Thuy Anh",
          "role": "Muse"
        }
      ]
    },
    {
      "id": "31c58199-5ac5-5b0f-a13b-5234f627fe9d",
      "title": "Rudy Martins — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/artist-2.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Rudy Martins",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "da8e99d8-7de0-5f81-9b7c-ced0f0b5808a",
      "title": "Avo Yermagyan — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/artist-3.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Avo Yermagyan",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "178177d5-a3ba-5a53-ba05-8d849154c98c",
      "title": "Shameelah Hicks — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "/assets/artist-4.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Shameelah Hicks",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "5e09b273-1dbf-5655-bea2-b5d639192a6a",
      "title": "Brandon Tan — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/93b6ecf1-1836-4403-b1a8-4ad17bdbbada/202504_COSMOPOLITAN_EJOHNSON_BTN_07?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Brandon Tan",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "4a80aa44-7a3a-5c4d-ae1c-42c0f8775af8",
      "title": "Alice Moore — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/07/202406_HOLLYWOODREPORTER_GAROCH_ALM_MFR_12.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Alice Moore",
          "role": "Grooming"
        }
      ]
    },
    {
      "id": "1cbd3da8-8a35-5511-a1cd-5bd415cfd077",
      "title": "Benjamin Puckey — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/e20814c8-48eb-4f86-95ed-cde877ed6d8a/202506_LOVEWANT_ASERGE_BPY_03?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Benjamin Puckey",
          "role": "Makeup"
        }
      ]
    },
    {
      "id": "96d812a4-8b7f-54b9-8948-be9a06733f31",
      "title": "Ana Tess — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/06/202411_WHATEVR_BMARION_ATS_07-scaled.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Ana Tess",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "79d7ce07-a12e-5547-81da-2a1fb9a09eb6",
      "title": "Sasha Nesterchuk — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/06/202511_DOUBLEVISION_LUIGIIANGO_SNK_06.jpeg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Sasha Nesterchuk",
          "role": "Hair"
        }
      ]
    },
    {
      "id": "23681b5c-e033-5d2d-a395-4389ae8f4f51",
      "title": "Jillian Dempsey — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/8a4fcfb5-82bf-4cce-b491-3c9754eb1456/202102_VANITYFAIRFR_CBUCHANAN_JDY_09?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Jillian Dempsey",
          "role": "Makeup, Digital Creators"
        }
      ]
    },
    {
      "id": "de4c021d-de8b-5f3c-8fca-120e8d3de1f7",
      "title": "Kendra Alia — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/05/202602_MIUMIU_UNKNOWN_KAA_01.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Kendra Alia",
          "role": "Hair, Color, Digital Creators"
        }
      ]
    },
    {
      "id": "45135228-05d6-54d0-b369-8cd168b907a0",
      "title": "Austen Turner — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/04/202507_FLAUNT_MSELIGER_ATN_MAS_08-scaled.jpg",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Austen Turner",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "aeeb4317-fed9-5a20-9bb2-ede988afcd93",
      "title": "Jay Hines — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.bynder.com/transform/98bd30f8-6e32-4212-a1b7-65a5a7192aaf/202306_SHARP_CGRAY_JHS_04?quality=85",
          "media_type": "image",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Jay Hines",
          "role": "Styling"
        }
      ]
    },
    {
      "id": "d5cad64c-2fba-5b44-b292-0cb314b0bf1f",
      "title": "Kirsty Stewart — Debut",
      "kind": "New Signing",
      "is_published": true,
      "show_on_home": true,
      "media": [
        {
          "url": "https://thewallgroup.com/wp-content/uploads/2026/04/202503_FERRAGAMO_EGUZZI_KRS_12.mp4",
          "media_type": "video",
          "object_position": "50% 18%"
        }
      ],
      "credits": [
        {
          "name": "Kirsty Stewart",
          "role": "Styling"
        }
      ]
    }
  ],
  "slides": [
    {
      "id": "63067b31-fe65-534c-b2e6-def722114256",
      "publication": "The Gilded Frame",
      "credit_line": "Bincio — Photography, Nguyen Tan Thanh — Styling",
      "image_url": "/assets/stories/gilded-frame-05.jpg",
      "object_position": "50% 28%",
      "caption_color": "#fff"
    },
    {
      "id": "00abb8dd-9249-5862-a165-451bb70dad42",
      "publication": "Cadmium",
      "credit_line": "Dinh Tran — Makeup, Nguyen Tan Thanh — Styling",
      "image_url": "/assets/stories/art-02-20.jpg",
      "object_position": "50% 45%",
      "caption_color": "#fff"
    },
    {
      "id": "e5f3363b-aa2f-5412-9f9c-f3965d2578dd",
      "publication": "Golden Spiral",
      "credit_line": "Nguyen Tan Thanh — Styling, May Truong — Hair",
      "image_url": "/assets/stories/art-02-09.jpg",
      "object_position": "50% 50%",
      "caption_color": "#fff"
    },
    {
      "id": "d7a4ab7f-7112-572d-8b05-5f7b0107bf85",
      "publication": "Porcelain Garden",
      "credit_line": "Bincio — Photography, Shishi — Hair",
      "image_url": "/assets/stories/art-02-02.jpg",
      "object_position": "50% 30%",
      "caption_color": "#fff"
    },
    {
      "id": "25191e8f-74a3-5f0d-b999-80a0fff85dc9",
      "publication": "Traces of Memories",
      "credit_line": "Diego Nguyen — Makeup, Shishi — Hair",
      "image_url": "/assets/stories/traces-02.jpg",
      "object_position": "50% 38%",
      "caption_color": "#fff"
    },
    {
      "id": "62e915e4-414c-5765-a2a4-0685b78e024a",
      "publication": "Setting Curls",
      "credit_line": "May Truong — Hair, Dinh Tran — Makeup",
      "image_url": "/assets/stories/setting-curls-05.jpg",
      "object_position": "50% 30%",
      "caption_color": "#000"
    },
    {
      "id": "7d3c4fd2-66b7-5bcd-8f70-e71b88f01069",
      "publication": "The Soulful Splendor",
      "credit_line": "Dinh Tran — Makeup, May Truong — Hair",
      "image_url": "/assets/stories/elle-05.jpg",
      "object_position": "50% 30%",
      "caption_color": "#000"
    },
    {
      "id": "ecb4e63b-69f6-56e2-b744-4dcd6ad88113",
      "publication": "The Gilded Frame",
      "credit_line": "May Truong — Hair",
      "image_url": "/assets/stories/gilded-frame-02.jpg",
      "object_position": "50% 25%",
      "caption_color": "#fff"
    }
  ],
  "blocks": [
    {
      "id": "e0d71d4e-0acd-5a2f-9e8a-771643a27843",
      "label": "Latest Editorials",
      "layout": "Scroll row",
      "source_kind": "Editorial",
      "is_visible": true,
      "album_id": null,
      "image_url": ""
    },
    {
      "id": "0a126062-5ee0-5b7c-8ac4-5b5057d9fe13",
      "label": "Latest Campaigns",
      "layout": "Scroll row",
      "source_kind": "Campaign",
      "is_visible": true,
      "album_id": null,
      "image_url": ""
    },
    {
      "id": "197e84c6-0940-5a07-9ae5-1ef01fa1b0c3",
      "label": "Latest Editorial",
      "layout": "Full-bleed",
      "source_kind": "Editorial",
      "is_visible": true,
      "album_id": "7df7b959-e1b7-5965-9b12-82ede5c12f02",
      "image_url": ""
    },
    {
      "id": "cc0196c1-7cfe-5982-9205-c3d1f3d85503",
      "label": "Paris Haute Couture Fashion Week",
      "layout": "Scroll row",
      "source_kind": "Couture",
      "is_visible": true,
      "album_id": null,
      "image_url": ""
    },
    {
      "id": "64d2e0ba-b7ab-55db-8f8e-8397bc66567b",
      "label": "Paris & Milan Fashion Weeks",
      "layout": "Scroll row",
      "source_kind": "Fashion Week",
      "is_visible": true,
      "album_id": null,
      "image_url": ""
    },
    {
      "id": "4da41220-4bc0-5d97-add4-57f5d5917faf",
      "label": "Traces of Memories",
      "layout": "Banner",
      "source_kind": "Editorial",
      "is_visible": true,
      "album_id": null,
      "image_url": "/assets/traces-of-memories-credits.jpg"
    },
    {
      "id": "bb3939fb-3174-50bc-b6bb-0aafe82920f5",
      "label": "New Signs",
      "layout": "Scroll row",
      "source_kind": "New Signing",
      "is_visible": true,
      "album_id": null,
      "image_url": ""
    }
  ]
}
$seed_json$::jsonb, 0);
end;
$seed_block$;
