package it.controllers;

import it.beans.UserBean;
import it.dao.UserDAO;
import org.apache.commons.codec.digest.DigestUtils;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet(name = "LoginChecker", value = "/logincheck")
@MultipartConfig
public class LoginChecker extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //controllo se l'utente è già loggato e in caso affermativo viene rediretto alla home
        if(request.getSession(false)!=null ) {
            if(request.getSession(false).getAttribute("user")!=null) {
                String homepage = "/areapersonale/home";
                System.out.println("LoginChecker: l'utente esiste già ed è già loggato come "+((UserBean)request.getSession().getAttribute("user")).getUsername()+" -> redirect to HomeHandler");
                response.sendRedirect(request.getContextPath()+homepage);

            }
        } else {
            String username = request.getParameter("username");
            String password = request.getParameter("password");
            System.out.println("LoginChecker: la password è: " + password + "\n");

            //caso 1a: dati inseriti in formato non valido
            if (username == null || username.isBlank() || password == null || password.isBlank() || !username.matches("^[a-zA-Z0-9]*$")) {
                System.out.println("LoginChecker: i dati non sono validi -> dispatching edited LoginFile.html");
                response.getWriter().println("Il formato di username e/o password non e' valido");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

                //caso 1b: formato dati valido
            } else {
                String pwhash = DigestUtils.sha256Hex(password);
                System.out.println("LoginChecker: l'hash della password è: " + pwhash);
                UserBean u = null;
                try {
                    UserDAO ud = new UserDAO(DBConnectionSupplier.getConnection());
                    u = ud.findUserByUName(username);
                    //caso 1b/2a: l'utente non esiste
                    if (u == null) {
                        response.getWriter().println("L'utente inserito non esiste");
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        System.out.println("LoginChecker: utente non trovato -> dispatching edited LoginFile.html");

                        //caso 1b/2b: l'utente esiste
                    } else {

                        System.out.println("LoginChecker: l'hash nel db è: "+u.getHash());
                        //caso 1b/2b/3a: la password è corretta
                        if (pwhash.equals(u.getHash())) {
                            request.getSession(true).setAttribute("user", u);
                            String homepage = "/areapersonale/home";
                            //todo mandare indietro 200 senza redirect
                            response.setStatus(HttpServletResponse.SC_OK);
                            System.out.println("LoginChecker: la password è corretta, utente loggato come "+((UserBean)request.getSession().getAttribute("user")).getUsername()+" -> send back 200");

                            //caso 1b/2b/3b: la password è errata
                        } else {
                            System.out.println("LoginChecker: la password è errata -> dispatching edited LoginFile.html");
                            response.getWriter().println("La password e' errata");
                            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        }
                    }
                } catch (SQLException e) {
                    e.printStackTrace();
                    response.getWriter().println("Il servizio e' temporaneamente non disponibile, riprovare piu' tardi");
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    System.out.println("LoginChecker: errore del DB -> dispatching edited LoginFIle.html");
                }


            }
        }
    }
}
