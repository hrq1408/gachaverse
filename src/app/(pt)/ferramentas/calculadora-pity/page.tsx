import { PityPage } from '@/components/pity-page';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata('Calculadora de pity de Honkai: Star Rail', 'Calcule quantos Saltos, Jades Estelares e Passes Especiais faltam para garantir o personagem ou Cone de Luz em destaque.', '/ferramentas/calculadora-pity/');
export default function Pity() { return <PityPage locale="pt-BR" />; }
