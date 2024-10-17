import {Inter} from 'next/font/google';
import {Lusitana} from 'next/font/google';
import {Noto_Sans_Khmer} from 'next/font/google';

export const inter = Inter({subsets: ['latin']});

export const lusitana = Lusitana({
    weight: ['400', '700'],
    subsets: ['latin']
})

export const notoSans = Noto_Sans_Khmer({
    weight: ['400', '700'],
    subsets: ['khmer']
})