'use client';

import useSWR from 'swr';
import { Post } from '@/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ClientPosts() {
  const { data } = useSWR<Post[]>(
    'https://jsonplaceholder.typicode.com/posts?_limit=3',
    fetcher
  );

  if (!data) return <p>جارٍ التحميل.</p>;

  return (
    <ul className="space-y-2">
      {data.map((p) => (
        <li key={p.id} className="border border-white/20 p-3 rounded text-white/90">
          {p.title}
        </li>
      ))}
    </ul>
  );
}