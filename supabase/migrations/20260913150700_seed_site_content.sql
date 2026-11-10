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
      "title": "Riflesso Studio",
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
          "name": "Bincio",
          "role": "Photography"
        }
      ]
    },
    {
      "id": "1dc0b0a8-0bb3-570a-8af1-1f44d6d1c2d5",
      "title": "Riflesso Studio",
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
          "name": "Bincio",
          "role": "Photography"
        }
      ]
    },
    {
      "id": "459f53c1-ffd7-5ce8-bb2a-a9dc03edefa0",
      "title": "Riflesso Studio",
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
          "name": "Bincio",
          "role": "Photography"
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
      "id": "4f1ce920-9709-5a94-8442-c6fbd3c3f8c6",
      "title": "Riflesso Studio",
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
          "name": "Bincio",
          "role": "Photography"
        }
      ]
    },
    {
      "id": "4b09dde4-384a-5ea4-8a79-d389c79a8f82",
      "title": "Riflesso Studio",
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
          "name": "Bincio",
          "role": "Photography"
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
      "title": "Bincio — Debut",
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
          "name": "Bincio",
          "role": "Photography"
        }
      ]
    },
    {
      "id": "da8e99d8-7de0-5f81-9b7c-ced0f0b5808a",
      "title": "Bincio — Debut",
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
          "name": "Bincio",
          "role": "Photography"
        }
      ]
    },
    {
      "id": "178177d5-a3ba-5a53-ba05-8d849154c98c",
      "title": "Bincio — Debut",
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
          "name": "Bincio",
          "role": "Photography"
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
