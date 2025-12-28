import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Legal.css';

const Terms = () => {
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
        <h1>Termos de Uso</h1>
        <span className="last-updated">Última atualização: Dezembro de 2024</span>

        <section>
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar a plataforma ReCaatinga, você concorda em cumprir e estar 
            vinculado aos seguintes termos e condições de uso. Se você não concorda com 
            qualquer parte destes termos, não deve usar nossa plataforma.
          </p>
        </section>

        <section>
          <h2>2. Descrição do Serviço</h2>
          <p>
            O ReCaatinga é uma plataforma educacional gamificada focada na regeneração e 
            preservação da Caatinga através de missões práticas, jogos educacionais e 
            monitoramento de impacto ambiental. A plataforma oferece:
          </p>
          <ul>
            <li>Missões práticas de plantio e conservação</li>
            <li>Jogos educativos sobre o bioma da Caatinga</li>
            <li>Sistema de pontuação e ranking</li>
            <li>Vídeo aulas sobre meio ambiente</li>
            <li>Acompanhamento de progresso educacional</li>
          </ul>
        </section>

        <section>
          <h2>3. Cadastro e Conta de Usuário</h2>
          <p>
            Para utilizar a plataforma, você deve criar uma conta fornecendo informações 
            verdadeiras, precisas e atualizadas. Você é responsável por:
          </p>
          <ul>
            <li>Manter a confidencialidade de sua senha</li>
            <li>Todas as atividades realizadas em sua conta</li>
            <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
            <li>Garantir que tem idade mínima ou autorização dos responsáveis</li>
          </ul>
        </section>

        <section>
          <h2>4. Uso Aceitável</h2>
          <p>Você concorda em NÃO:</p>
          <ul>
            <li>Usar a plataforma para qualquer propósito ilegal ou não autorizado</li>
            <li>Enviar conteúdo falso, enganoso ou fraudulento</li>
            <li>Interferir ou interromper o funcionamento da plataforma</li>
            <li>Tentar acessar contas ou dados de outros usuários</li>
            <li>Copiar, modificar ou distribuir conteúdo da plataforma sem autorização</li>
            <li>Usar bots, scripts ou outras ferramentas automatizadas</li>
            <li>Violar direitos de propriedade intelectual</li>
          </ul>
        </section>

        <section>
          <h2>5. Conteúdo do Usuário</h2>
          <p>
            Ao enviar fotos, textos, vídeos ou outros conteúdos para a plataforma 
            (especialmente em tarefas práticas de plantio e conservação), você:
          </p>
          <ul>
            <li>Garante que possui todos os direitos necessários sobre o conteúdo</li>
            <li>Concede ao ReCaatinga licença para usar esse conteúdo para fins educacionais</li>
            <li>Autoriza o uso para divulgação do projeto (com atribuição apropriada)</li>
            <li>Garante que o conteúdo não viola direitos de terceiros</li>
          </ul>
        </section>

        <section>
          <h2>6. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo, design, código-fonte, materiais educacionais, logotipos e 
            marcas da plataforma ReCaatinga são propriedade do projeto e estão protegidos 
            por leis de direitos autorais e propriedade intelectual.
          </p>
        </section>

        <section>
          <h2>7. Sistema de Pontos e Gamificação</h2>
          <p>
            Os pontos, níveis, títulos e conquistas obtidos na plataforma:
          </p>
          <ul>
            <li>Não possuem valor monetário</li>
            <li>São apenas para fins educacionais e de motivação</li>
            <li>Podem ser ajustados ou redefinidos conforme necessário</li>
            <li>Não podem ser transferidos ou vendidos</li>
          </ul>
        </section>

        <section>
          <h2>8. Verificação de Tarefas</h2>
          <p>
            As tarefas práticas enviadas serão analisadas por administradores. O ReCaatinga 
            reserva-se o direito de rejeitar submissões que não atendam aos critérios 
            estabelecidos ou que contenham informações falsas.
          </p>
        </section>

        <section>
          <h2>9. Modificações</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. 
            Mudanças significativas serão notificadas através da plataforma. Continuando 
            a usar a plataforma após as mudanças, você aceita os novos termos.
          </p>
        </section>

        <section>
          <h2>10. Encerramento de Conta</h2>
          <p>
            Podemos suspender ou encerrar sua conta se você:
          </p>
          <ul>
            <li>Violar estes termos de uso</li>
            <li>Usar a plataforma de forma inadequada ou fraudulenta</li>
            <li>Enviar conteúdo ofensivo ou prejudicial</li>
            <li>Tentar prejudicar outros usuários ou a plataforma</li>
          </ul>
        </section>

        <section>
          <h2>11. Limitação de Responsabilidade</h2>
          <p>
            A plataforma é fornecida "como está". Não garantimos que será ininterrupta 
            ou livre de erros. Não nos responsabilizamos por danos diretos ou indiretos 
            decorrentes do uso da plataforma.
          </p>
        </section>

        <section>
          <h2>12. Projeto Educacional</h2>
          <p>
            O ReCaatinga é um projeto educacional desenvolvido com apoio da FAPEAL - 
            PIBIC Jr em parceria com a E.E. Professora Joanita de Melo, Ouro Branco, 
            Alagoas. Todos os dados coletados são utilizados exclusivamente para fins 
            educacionais e de pesquisa.
          </p>
        </section>

        <section>
          <h2>13. Contato</h2>
          <p>
            Para questões sobre estes termos, sugestões ou reportar problemas, 
            entre em contato através da Escola Estadual Professora Joanita de Melo, 
            Ouro Branco, Alagoas, ou através dos canais de comunicação disponíveis 
            na plataforma.
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

export default Terms;
