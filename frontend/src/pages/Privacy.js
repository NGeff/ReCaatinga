import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Legal.css';

const Privacy = () => {
  return (
    <div className="legal-wrapper">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <FaArrowLeft />
            <span>Voltar</span>
          </Link>
        </div>
      </header>

      <div className="legal-content">
        <h1>Política de Privacidade</h1>
        <span className="last-updated">Última atualização: Dezembro de 2024</span>

        <section>
          <h2>1. Informações que Coletamos</h2>
          <p>
            Para fornecer nossos serviços educacionais, coletamos as seguintes 
            informações:
          </p>
          <ul>
            <li>Nome completo e endereço de email fornecidos no cadastro</li>
            <li>Fotos enviadas em tarefas práticas de plantio e conservação</li>
            <li>Dados de geolocalização quando você compartilha a localização em tarefas</li>
            <li>Progresso educacional, pontuação e conquistas nos jogos</li>
            <li>Informações de uso da plataforma (páginas visitadas, tempo de uso)</li>
            <li>Comentários e descrições em submissões de tarefas</li>
          </ul>
        </section>

        <section>
          <h2>2. Como Usamos Suas Informações</h2>
          <p>Usamos suas informações para:</p>
          <ul>
            <li>Gerenciar sua conta e permitir autenticação segura</li>
            <li>Acompanhar e registrar seu progresso educacional</li>
            <li>Verificar e validar tarefas práticas enviadas</li>
            <li>Enviar notificações sobre seu progresso e conquistas</li>
            <li>Melhorar a plataforma e desenvolver novos recursos</li>
            <li>Comunicar informações importantes sobre o projeto</li>
            <li>Gerar relatórios educacionais e estatísticas agregadas</li>
            <li>Fins de pesquisa acadêmica (sempre de forma anonimizada)</li>
          </ul>
        </section>

        <section>
          <h2>3. Compartilhamento de Dados</h2>
          <p>
            Levamos sua privacidade a sério. Nós NÃO vendemos, alugamos ou 
            compartilhamos seus dados pessoais com terceiros para fins comerciais.
          </p>
          <p>Podemos compartilhar dados apenas nas seguintes situações:</p>
          <ul>
            <li>Com instituições parceiras do projeto educacional (FAPEAL, escola)</li>
            <li>Para divulgação científica e educacional do projeto (sempre anonimizado)</li>
            <li>Fotos de tarefas aprovadas podem ser usadas em materiais de divulgação (com seu consentimento explícito)</li>
            <li>Quando exigido por lei ou ordem judicial</li>
          </ul>
        </section>

        <section>
          <h2>4. Segurança dos Dados</h2>
          <p>
            Implementamos medidas técnicas e organizacionais para proteger suas 
            informações pessoais:
          </p>
          <ul>
            <li>Criptografia de senhas usando algoritmos seguros (bcrypt)</li>
            <li>Conexões HTTPS seguras em toda a plataforma</li>
            <li>Acesso restrito aos dados apenas para administradores autorizados</li>
            <li>Backups regulares para prevenir perda de dados</li>
            <li>Monitoramento de segurança e atualizações constantes</li>
          </ul>
          <p>
            Apesar de nossos esforços, nenhum sistema é 100% seguro. Você também 
            deve proteger suas credenciais e não compartilhar sua senha.
          </p>
        </section>

        <section>
          <h2>5. Seus Direitos</h2>
          <p>
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os 
            seguintes direitos:
          </p>
          <ul>
            <li>Acessar todos os seus dados pessoais armazenados</li>
            <li>Solicitar correção de dados incorretos ou incompletos</li>
            <li>Solicitar exclusão permanente de sua conta e dados</li>
            <li>Retirar consentimento para uso de fotos em divulgação</li>
            <li>Exportar seus dados em formato legível</li>
            <li>Ser informado sobre o uso de seus dados</li>
            <li>Opor-se ao tratamento de dados em certas situações</li>
          </ul>
          <p>
            Para exercer esses direitos, entre em contato através dos canais 
            disponíveis na plataforma.
          </p>
        </section>

        <section>
          <h2>6. Cookies e Tecnologias Similares</h2>
          <p>
            Usamos cookies e tecnologias similares para:
          </p>
          <ul>
            <li>Manter sua sessão ativa enquanto usa a plataforma</li>
            <li>Lembrar suas preferências de uso</li>
            <li>Analisar como a plataforma é utilizada (Google Analytics)</li>
          </ul>
          <p>
            Não usamos cookies de rastreamento de terceiros para publicidade. 
            Você pode configurar seu navegador para recusar cookies, mas isso 
            pode afetar o funcionamento da plataforma.
          </p>
        </section>

        <section>
          <h2>7. Dados de Menores de Idade</h2>
          <p>
            A plataforma é voltada principalmente para estudantes do ensino médio. 
            Reconhecemos que muitos usuários podem ser menores de 18 anos:
          </p>
          <ul>
            <li>O uso por menores deve ter autorização dos pais ou responsáveis</li>
            <li>Tomamos cuidados especiais com dados de menores</li>
            <li>Pais e responsáveis podem solicitar acesso aos dados do menor</li>
            <li>Seguimos rigorosamente as normas da LGPD sobre dados de crianças e adolescentes</li>
          </ul>
        </section>

        <section>
          <h2>8. Retenção de Dados</h2>
          <p>
            Mantemos seus dados pelo tempo necessário para:
          </p>
          <ul>
            <li>Fornecer os serviços educacionais da plataforma</li>
            <li>Cumprir obrigações legais</li>
            <li>Fins de pesquisa acadêmica (de forma anonimizada)</li>
          </ul>
          <p>
            Quando você solicita exclusão da conta, seus dados pessoais são 
            removidos, mas dados anonimizados podem ser mantidos para pesquisa 
            e estatísticas.
          </p>
        </section>

        <section>
          <h2>9. Transferência Internacional de Dados</h2>
          <p>
            Seus dados são armazenados em servidores localizados no Brasil. 
            Alguns serviços de suporte (como hospedagem e email) podem processar 
            dados em outros países, mas sempre com garantias adequadas de proteção.
          </p>
        </section>

        <section>
          <h2>10. Alterações na Política</h2>
          <p>
            Podemos atualizar esta política de privacidade periodicamente para 
            refletir mudanças em nossas práticas ou na legislação. Mudanças 
            significativas serão notificadas através da plataforma e por email.
          </p>
          <p>
            Recomendamos que você revise esta política regularmente. A data da 
            última atualização está sempre indicada no topo desta página.
          </p>
        </section>

        <section>
          <h2>11. Base Legal para Processamento</h2>
          <p>
            Processamos seus dados pessoais com base em:
          </p>
          <ul>
            <li>Seu consentimento explícito ao criar a conta</li>
            <li>Necessidade para executar o serviço educacional contratado</li>
            <li>Cumprimento de obrigações legais</li>
            <li>Interesse legítimo para melhoria do serviço e pesquisa educacional</li>
          </ul>
        </section>

        <section>
          <h2>12. Contato e Encarregado de Dados</h2>
          <p>
            Para questões sobre privacidade, exercer seus direitos ou reportar 
            preocupações, entre em contato:
          </p>
          <ul>
            <li>Escola Estadual Professora Joanita de Melo</li>
            <li>Ouro Branco, Alagoas</li>
            <li>Através dos canais de comunicação disponíveis na plataforma</li>
          </ul>
          <p>
            Responderemos todas as solicitações em até 15 dias úteis, conforme 
            estabelecido pela LGPD.
          </p>
        </section>
      </div>

      <footer className="legal-footer">
        <div className="container">
          <p>© 2024 ReCaatinga - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
