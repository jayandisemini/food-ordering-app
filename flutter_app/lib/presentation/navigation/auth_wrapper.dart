import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../state/app_session.dart';
import '../screens/admin_dashboard_screen.dart';
import '../screens/login_screen.dart';
import 'root_shell.dart';

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  late final Future<Session?> _initialSession;

  @override
  void initState() {
    super.initState();
    _initialSession = Future<Session?>.value(
      Supabase.instance.client.auth.currentSession,
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Session?>(
      future: _initialSession,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const _LoadingScreen();
        }
        return StreamBuilder<AuthState>(
          stream: Supabase.instance.client.auth.onAuthStateChange,
          builder: (context, authSnapshot) {
            final streamedSession = authSnapshot.data?.session;
            final session = streamedSession ??
                snapshot.data ??
                Supabase.instance.client.auth.currentSession;
            final appSession = context.watch<AppSession>();
            if (appSession.isAdmin) return const AdminDashboardScreen();
            if (appSession.isGuest || session != null) {
              return const RootShell();
            }
            return LoginScreen(
              startInRegisterMode: appSession.showRegister,
              onRegisterIntentConsumed: appSession.consumeRegisterIntent,
              onContinueAsGuest: appSession.enterGuest,
            );
          },
        );
      },
    );
  }
}

class _LoadingScreen extends StatelessWidget {
  const _LoadingScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF121212),
      body: Center(child: CircularProgressIndicator(color: Color(0xFFFF6B2C))),
    );
  }
}
