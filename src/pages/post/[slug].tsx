/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticPaths, GetStaticProps } from 'next';

import { RichText } from 'prismic-dom';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import styles from './post.module.scss';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const totalWords = post.data.content.reduce((acc, content) => {
    const totalWordsInPost = RichText.asText(content.body).split(' ').length;
    const totalHeadingsInPost = content.heading.split(' ').length;

    return acc + totalWordsInPost + totalHeadingsInPost;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }
  return (
    <section className={styles.container}>
      <Header />

      <div className={styles.imgContainer}>
        <img src={post.data.banner.url} alt="banner" />
      </div>

      <main className={styles.content}>
        <h1>{post.data.title}</h1>

        <section className={styles.iconsContainer}>
          <span>
            <FiCalendar size={20} />
            {format(new Date(post.first_publication_date), 'dd  MMM yyyy', {
              locale: ptBR,
            })}
          </span>

          <span>
            <FiUser size={20} />
            {post.data.author}
          </span>

          <span>
            <FiClock size={20} />
            {`${readTime} min`}
          </span>
        </section>

        {post.data.content.map(content => {
          return (
            <article className={styles.articleContent} key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                className={styles.postContent}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          );
        })}
      </main>
    </section>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const slug = String(params?.slug);

  const response = await prismic.getByUID('posts', slug);
  return {
    props: {
      post: response,
    },
    revalidate: 60 * 60, // 1 hour
  };
};
