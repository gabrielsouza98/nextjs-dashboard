import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css'; // ← IMPORTANTE
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image'; // ← ADICIONE ISSO

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">

      {/* Triângulo feito via CSS Modules */}
      <div className={styles.shape} />

      {/* Header com logo */}
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>

      {/* Texto usando a fonte secundária */}
      <p className={`${lusitana.className} text-xl mt-4`}>
        Bem-vindo ao dashboard!
      </p>

      {/* Texto normal */}
      <p className="mt-4">Algum texto aqui...</p>

      {/* Div para imagens do Hero */}
      <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">

        {/* IMAGEM DESKTOP - aparece só em telas grandes */}
        <Image
          src="/hero-desktop.png"
          width={1000}
          height={760}
          className="hidden md:block"
          alt="Screenshots of the dashboard project showing desktop version"
        />

        {/* IMAGEM MOBILE - aparece só em telas pequenas */}
        <Image
          src="/hero-mobile.png"
          width={560}
          height={620}
          className="block md:hidden"
          alt="Screenshots of the dashboard project showing mobile version"
        />

      </div>

    </main>
  );
}
