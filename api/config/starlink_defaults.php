<?php

/**
 * Default site settings. PLACEHOLDERS taken from the design mockups — confirm every value
 * (contact details, statistics, regions) in Admin → Settings before launch.
 */
return [
    'company_name' => 'Starlink Enterprises',
    'tagline' => 'Solutions. Growth. Excellence.',
    'phone' => '+91 84483 42364',
    'phone_secondary' => '',
    'email' => 'starlinkenterprises51@gmail.com',
    'email_secondary' => '',
    'address' => 'Agra, Uttar Pradesh, India',
    'working_hours' => '',
    'map_url' => 'https://www.google.com/maps/search/?api=1&query=Agra,+Uttar+Pradesh,+India',
    'contact_person' => ['name' => 'Karan Singh', 'role' => 'Director'],
    'business_type' => 'Civil, MEP & Turnkey Commercial Interior Contracting',
    'whatsapp' => '',
    'socials' => ['facebook' => '', 'linkedin' => '', 'instagram' => '', 'youtube' => ''],
    'notification_email' => 'starlinkenterprises51@gmail.com',
    'footer_text' => 'Turnkey execution for retail and commercial spaces. Civil, MEP and interiors — managed by one team, start to finish.',
    'default_meta_title' => 'Starlink Enterprises | Retail & Commercial Fit-Outs',
    'default_meta_description' => 'Turnkey execution for retail and commercial spaces. Civil, MEP and interior fit-outs — managed by one team, start to finish.',
    'default_og_image' => '/assets/og-default.jpg',
    'hero_stats' => [
        ['icon' => 'CalendarDays', 'value' => '2026', 'label' => 'Operational Since'],
        ['icon' => 'MapPin', 'value' => 'Pan-India', 'label' => 'Execution Reach'],
        ['icon' => 'Layers', 'value' => '3-in-1', 'label' => 'Civil · MEP · Interiors'],
    ],
    'stats' => [
        ['label' => 'Projects Delivered', 'value' => 100, 'suffix' => '+'],
        ['label' => 'Happy Clients', 'value' => 50, 'suffix' => '+'],
        ['label' => 'Cities Across India', 'value' => 12, 'suffix' => '+'],
        ['label' => 'On-Time Delivery', 'value' => 100, 'suffix' => '%'],
    ],
    'process' => [
        ['id' => 1, 'title' => 'Understand Requirements', 'description' => 'We study your brand, space, budget and timelines to define a clear scope.', 'icon' => 'ClipboardList'],
        ['id' => 2, 'title' => 'Plan & Design', 'description' => 'Layouts, drawings and execution plans aligned with your brand standards.', 'icon' => 'PencilRuler'],
        ['id' => 3, 'title' => 'Execute Civil, MEP & Interiors', 'description' => 'One coordinated team delivers structure, services and finishing.', 'icon' => 'HardHat'],
        ['id' => 4, 'title' => 'Quality Check & Testing', 'description' => 'Systematic inspection and testing before the space is handed over.', 'icon' => 'ShieldCheck'],
        ['id' => 5, 'title' => 'Handover & Support', 'description' => 'Final handover with documentation and post-handover support.', 'icon' => 'KeyRound'],
    ],
    'benefits' => [
        ['id' => 1, 'title' => 'Single Point of Contact', 'description' => 'One accountable team from concept to handover.', 'icon' => 'UserCheck'],
        ['id' => 2, 'title' => 'Integrated Civil, MEP & Interiors', 'description' => 'All disciplines coordinated under one roof.', 'icon' => 'Layers'],
        ['id' => 3, 'title' => 'Project Coordination', 'description' => 'Structured planning and clear communication throughout.', 'icon' => 'Workflow'],
        ['id' => 4, 'title' => 'Quality & Safety', 'description' => 'Quality checks and safe site practices on every project.', 'icon' => 'ShieldCheck'],
        ['id' => 5, 'title' => 'Timely Delivery', 'description' => 'Committed timelines with transparent progress tracking.', 'icon' => 'Timer'],
        ['id' => 6, 'title' => 'Vendor Coordination', 'description' => 'We manage vendors, materials and site logistics for you.', 'icon' => 'Truck'],
        ['id' => 7, 'title' => 'Cost Transparency', 'description' => 'Value-driven solutions with clear, itemised costing.', 'icon' => 'Wallet'],
        ['id' => 8, 'title' => 'Pan-India Execution Capability', 'description' => 'Ability to execute projects across multiple cities.', 'icon' => 'MapPinned'],
    ],
    'regions' => [
        ['name' => 'Noida', 'state' => 'Uttar Pradesh'], ['name' => 'Delhi', 'state' => 'NCR'], ['name' => 'Agra', 'state' => 'Uttar Pradesh'],
        ['name' => 'Lucknow', 'state' => 'Uttar Pradesh'], ['name' => 'Chandigarh', 'state' => 'Chandigarh'], ['name' => 'Jaipur', 'state' => 'Rajasthan'],
    ],
    'about' => [
        'heading' => 'Turning Blueprints into Built Spaces.',
        'intro' => 'Starlink Enterprises is a turnkey execution partner for retail and commercial fit-outs. We bring together civil, MEP and interior expertise to create functional, aesthetic and future-ready spaces.',
        'story' => [
            'Starlink Enterprises was founded with a clear vision — to deliver end-to-end execution for retail and commercial spaces under one roof.',
            'We combine technical expertise, creative design and project management excellence to transform ideas into real, high-performing spaces.',
        ],
        'vision' => 'To be India’s most trusted partner for retail and commercial space execution.',
        'mission' => 'To deliver innovative, efficient and high-quality spaces that elevate brands and enhance customer experiences.',
        'image' => '/assets/about.png',
    ],
];