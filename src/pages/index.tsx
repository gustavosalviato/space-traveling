import { GetStaticProps } from 'next';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { format } from 'date-fns'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link'
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';

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

  function fetchNextPage() {
    fetch(postsPagination.next_page)
      .then((res => res.json()))
      .then((res) => {
        return res.results.map((post) => {
          return {
            uid: post.uid,
            first_publication_date: format(new Date(post.first_publication_date), "dd  MMM yyyy", {
              locale: ptBR,
            }),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        })
      }).then((res) => setPosts(res))
  }

  return (
    <>
      <Header />

      <div className={styles.main}>
        <main className={styles.container}>
          {postsPagination.results?.map((post) => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h2>{post.data.title}</h2>

                <p>{post.data.subtitle}</p>

                <div className={styles.contentIcons}>
                  <div>
                    <FiCalendar size={20} fontWeight={800} />
                    {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                      locale: ptBR,
                    })}
                  </div>

                  <div>
                    <FiUser size={20} fontWeight={800} />
                    {post.data.author}
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {posts.map((post) => (
            <Link href={post.uid} key={post.uid}>
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

          {postsPagination.next_page !== null ? (
            <button onClick={fetchNextPage}>
              Carregar mais posts
            </button>
          ) :
            (
              <button onClick={fetchNextPage} >
                Carregar mais posts
              </button>
            )
          }
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postResponse = await prismic.getByType('posts', { pageSize: 1 })

  const posts = postResponse.results.map((post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const next_page = postResponse.next_page

  console.log(next_page)

  const postsPagination = {
    results: posts,
    next_page
  }


  return {
    props: {
      postsPagination
    }
  }
};
