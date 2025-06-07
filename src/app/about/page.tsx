import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: 'About | Italicninja',
  description: 'A bit about me and what I do with computers and automation.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <header className="mb-16 text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 drop-shadow-sm">Hey There!</h1><h1>👋</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Just a tech nerd who loves automating boring stuff
              </p>
            </header>
            
            <div className="bg-background border border-gray-200 dark:border-gray-800 rounded-lg shadow-small overflow-hidden mb-16 p-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  I&apos;m a Sysadmin who&apos;s obsessed with making computers do the boring work for us. I spend way too much time automating tasks that would probably take less time to do manually... but where&apos;s the fun in that?
                </p>

                <p>
                  I mess around with DevOps tools, Puppet, and all that infrastructure stuff. I&apos;ve built some cool automation with Terraform and Puppet that saved my team from the mind-numbing task of setting up servers manually.
                </p>

                <p>
                  When I&apos;m not glued to my terminal, I&apos;m probably trying to convince my coworkers that we can automate just about anything. They&apos;re starting to hide from me when they see me coming with &quot;another great idea.&quot;
                </p>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-medium tracking-tight text-foreground mb-6">Stuff I Play With</h3>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    Terraform (because clicking in the AWS console is for chumps)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    Puppet & Ansible (making servers behave since 2011)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    CI/CD Pipelines (or as I call them, &quot;robot assistants&quot;)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    Cloud stuff (AWS, Azure, GCP - all the acronyms)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    Docker & Kubernetes (containers all the way down)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    AI tools (teaching robots to watch other robots)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}