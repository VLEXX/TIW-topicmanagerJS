package it.controllers;

import it.beans.TopicBean;
import it.beans.UserBean;
import it.dao.TopicDAO;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;

@WebServlet(name = "TopicAdder", value = "/areapersonale/addtopic")
@MultipartConfig
public class TopicAdder extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String topicname = request.getParameter("newtopic");
        String ftopicname = request.getParameter("father");
        System.out.println("TopicAdder: ricevuti parametri nuova cat. "+topicname+" e padre "+ftopicname);
        if(ftopicname.equals("root_node"))
            ftopicname = null;


        //caso 1a: topicname nullo o vuoto
        if(topicname == null || topicname.isBlank() || !topicname.matches("^[a-zA-Z0-9 ]*$") || topicname.length() > 255){
            System.out.println("TopicAdder: i dati non sono validi -> send back 400");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("<span style=\"color:red;\">E' obbligatorio specificare la nuova categoria e deve essere alfanumerica (spazi ammessi) e puo' avere un massimo di 255 caratteri</span>");
        }else{
            Connection c = null;
            try {
                c = DBConnectionSupplier.getConnection();
                TopicDAO td = new TopicDAO(c);
                Integer resultid = td.findIdByTopic(topicname);
                //caso 1b/2a: topicname valido ma esiste già nel db
                if(resultid!=null){
                    System.out.println("TopicAdder: categoria già presente nel DB -> send back 400");
                    response.getWriter().write("<span style=\"color:red;\">La categoria inserita esiste gia'</span>");
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                }else{
                    //caso 1b/2b/3a: categoria padre non nulla
                    if(ftopicname!=null && !ftopicname.isBlank()){
                        resultid = td.findIdByTopic(ftopicname);
                        //caso 1b/2b/3a/4a: categoria padre inesistente
                        if(resultid==null){
                            System.out.println("TopicAdder: la categoria padre specificata non esiste -> dispatching edited Home.html");
                            response.getWriter().write( "<span style=\"color:red;\">Categoria padre specificata inesistente</span>");
                            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        }else{

                            ArrayList<Integer> children = td.findChildrenIdById(resultid);
                            //caso 1b/2b/3a/4b/5a: categoria padre esistente ma limite figli superato
                            if(children.size()>=9){
                                System.out.println("TopicAdder: limite massimo di 9 sottocategorie superato -> dispatching edited Home.html");
                                response.getWriter().write( "<span style=\"color:red;\">Impossibile aggiungere piu' di 9 sottocategorie</span>");
                                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                            }else{
                                System.out.println("TopicAdder: inserimento nuova categorie consentito");
                                td.insertNewTopic(topicname,resultid,children.size()+1);
                                response.setStatus(HttpServletResponse.SC_OK);
                                response.getWriter().write("<span style=\"color:green;\">Categoria '"+topicname+"' inserita con successo nel DB.</p>");
                            }

                        }

                        //caso 1b/2b/3b: categoria padre nulla (radice)
                    }else{
                        ArrayList<Integer> children = td.findChildrenIdById(resultid);
                        //caso 1b/2b/3b/6a:  limite figli alla radice superato
                        if(children.size()>=9){
                            System.out.println("TopicAdder: limite massimo di 9 sottocategorie superato (radice) -> dispatching edited Home.html");
                            response.getWriter().write( "<span style=\"color:red;\">Impossibile aggiungere piu' di 9 sottocategorie</span>");
                            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        }else{
                            System.out.println("TopicAdder: inserimento nuova categorie consentito (radice)");
                            td.insertNewTopic(topicname,resultid,children.size()+1);
                            response.getWriter().write("<span style=\"color:green;\">Categoria '"+topicname+"' inserita con successo.</span>");
                            response.setStatus(HttpServletResponse.SC_OK);
                        }

                    }
                }
                c.close();


            } catch (SQLException throwables) {
                throwables.printStackTrace();
                response.getWriter().write("<span style='color:red;'>Il servizio non è al momento disponibile, riprovare più tardi</span>");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }


        }

    }
}