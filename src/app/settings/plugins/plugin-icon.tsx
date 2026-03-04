'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plug } from 'lucide-react';

interface PluginIconProps {
    src: string;
    alt: string;
}

export default function PluginIcon({ src, alt }: PluginIconProps) {
    const [error, setError] = useState(false);

    if (error) {
        return <Plug className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            unoptimized
            onError={() => setError(true)}
        />
    );
}
