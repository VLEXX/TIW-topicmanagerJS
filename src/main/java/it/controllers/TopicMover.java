package it.controllers;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import it.beans.MoveBean;
import it.dao.TopicDAO;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet(name = "TopicMover", value = "/areapersonale/movetopic")
@MultipartConfig
public class TopicMover extends HttpServlet {


    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String movese = request.getParameter("moves");
        System.out.println("TopicMover: ricevuti spostamenti pari a: "+movese);
        if(movese == null || movese.isBlank()){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Lista richieste non formattata correttamente");
        }
        Gson gson = new Gson();
        Type listType = new TypeToken<ArrayList<MoveBean>>() {}.getType();
        ArrayList<MoveBean> moves = new ArrayList<>();
        Boolean allmovesok = false;
        try{
        moves.addAll(gson.fromJson(movese,listType));
        }catch (JsonSyntaxException e){
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("La lista inviata era corrotta");
        }
        try{
            Connection c = DBConnectionSupplier.getConnection();
            c.setAutoCommit(false);
            TopicDAO td = new TopicDAO(c);
            for(int i = 0; i< moves.size();i++){
                String source = moves.get(i).getSrc();
                String dest = moves.get(i).getDest();
                System.out.println("TopicMover: spostamento di "+source+" in "+dest);
                if(source==null||source.isBlank() || source.length()<6 || source.substring(0,source.length()-5).isBlank() ) {
                    System.out.println("TopicMover: la categoria da spostare non è stata definita correttamente");
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("La categoria da spostare (source) dello spostamento " + i + " non e' specificata");
                    break;
                }else {
                    source = source.substring(0, source.length() - 5);
                    Integer src = null, dst = null;
                    src = td.findIdByTopic(source);
                    System.out.println("TopicMover: ricerca nel DB di: "+source);
                    if (dest != null){
                        if(dest.length()<6){
                            response.getWriter().write("la destinazione scelta non e' valida");
                            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                            break;
                        }
                        dest = dest.substring(0, dest.length() - 5);
                        System.out.println("TopicMover: ricerca nel DB di: "+dest);
                        dst = td.findIdByTopic(dest);
                    }
                    if(src == null || (dst==null && dest != null)){
                        System.out.println("TopicMover: la categoria da spostare o la destinazione scelta non esistono");
                        response.getWriter().write("La categoria da spostare o la destinazione scelta non esistono");
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        break;
                    }else {
                        if ((dest!=null && td.getFatherHierarcy(dst).contains(src)) || dst == src) {
                            System.out.println("TopicSetter: impossibile spostare, la destinazione scelta coincide con o e' sottocategoria della categoria da spostare");
                            response.getWriter().write( "La destinazione scelta non e' valida in quanto coincide con o è sottocategoria della categoria da spostare");
                            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                            break;
                        }else{
                            int success = td.changeFatherTo(src, dst);
                            if (success == 1) {
                                System.out.println("TopicSetter: la destinazione ha gia' 9 sottocategorie");
                                response.getWriter().write("La destinazione ha gia' 9 sottocategorie");
                                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                                break;
                            } else {
                                System.out.println("TopicSetter: spostamento eseguito con successo -> redirect a home");
                                if(i == moves.size()-1)
                                    allmovesok = true;
                            }
                        }
                    }
                }




            }
            if(allmovesok){
                c.commit();
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("Spostamenti eseguiti con successo");
                System.out.println("TopicMover: tutti gli spostamenti sono stati eseguiti correttamente");
            }else{
                c.rollback();
            }
            c.close();
        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Errore del server nel processamento della richiesta");
        }

    }
}
