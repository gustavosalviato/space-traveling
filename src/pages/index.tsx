/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import styles from './home.module.scss';
import { getPrismicClient } from '../services/prismic';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function fetchNextPage() {
    if (nextPage === null) return;
    fetch(nextPage)
      .then(res => res.json())
      .then(res => {
        setNextPage(res.next_page);

        return res.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd  MMM yyyy',
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });
      })
      .then(res => setPosts(prevState => [...prevState, ...res]));
  }

  return (
    <>
      <Header />

      <div className={styles.main}>
        <main className={styles.container}>
          {postsPagination.results?.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h2>{post.data.title}</h2>

                <p>{post.data.subtitle}</p>

                <div className={styles.contentIcons}>
                  <div>
                    <FiCalendar size={20} fontWeight={800} />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </div>

                  <div>
                    <FiUser size={20} fontWeight={800} />
                    {post.data.author}
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h2>{post.data.title}</h2>

                <p>{post.data.subtitle}</p>

                <div className={styles.contentIcons}>
                  <div>
                    <FiCalendar size={20} fontWeight={800} />
                    {post.first_publication_date}
                  </div>

                  <div>
                    <FiUser size={20} fontWeight={800} />
                    {post.data.author}
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button onClick={fetchNextPage} type="button">
              Carregar mais posts
            </button>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postResponse = await prismic.getByType('posts', { pageSize: 1 });

  const posts = postResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const { next_page } = postResponse;

  const postsPagination = {
    results: posts,
    next_page,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
