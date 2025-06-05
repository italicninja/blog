import { getPostContentHtml } from "@/lib/posts";

interface PostContentProps {
  content: string;
}

export default async function PostContent({ content }: PostContentProps) {
  const contentHtml = await getPostContentHtml(content);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
  );
}