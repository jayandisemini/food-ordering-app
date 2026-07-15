import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../state/app_session.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    this.onContinueAsGuest,
    this.startInRegisterMode = false,
    this.onRegisterIntentConsumed,
  });

  final VoidCallback? onContinueAsGuest;
  final bool startInRegisterMode;
  final VoidCallback? onRegisterIntentConsumed;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  static const _adminEmail = 'admin.foodiego.2026@foodiego.app';
  static const _adminPassword = 'FoodieGoAdmin#2026';

  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _isLoading = false;
  bool _registerMode = false;

  @override
  void initState() {
    super.initState();
    _registerMode = widget.startInRegisterMode;
    widget.onRegisterIntentConsumed?.call();
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submitEmailAuth() async {
    final email = _email.text.trim();
    final password = _password.text;
    final name = _name.text.trim();

    if (email.isEmpty || password.length < 6) {
      _showError(
        'Enter a valid email and a password with at least 6 characters.',
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      if (!_registerMode &&
          email.toLowerCase() == _adminEmail &&
          password == _adminPassword) {
        await Supabase.instance.client.auth.signInWithPassword(
          email: email,
          password: password,
        );
        context.read<AppSession>().enterAdmin();
        return;
      }
      if (_registerMode) {
        if (name.isEmpty) {
          _showError('Enter your name to create an account.');
          return;
        }
        await Supabase.instance.client.auth.signUp(
          email: email,
          password: password,
          data: {'full_name': name, 'display_name': name},
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Account created. Check your email if confirmation is enabled.',
              ),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        await Supabase.instance.client.auth.signInWithPassword(
          email: email,
          password: password,
        );
      }
    } on AuthException catch (e) {
      _showError(e.message);
    } catch (_) {
      _showError('Unable to continue. Please try again.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);
    try {
      const webClientId =
          '711607449225-e64ime6lecdqnhquahv7frc0ojs4am1s.apps.googleusercontent.com';

      await GoogleSignIn.instance.initialize(serverClientId: webClientId);
      final googleUser = await GoogleSignIn.instance.authenticate();
      final idToken = googleUser.authentication.idToken;

      if (idToken == null) {
        throw const AuthException('No Google ID token found.');
      }

      final authorization = await GoogleSignIn.instance.authorizationClient
          .authorizationForScopes(<String>['email']);

      await Supabase.instance.client.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: authorization?.accessToken,
      );
    } catch (_) {
      _showError(
        'Google sign-in is not available right now. Try email sign-in or continue as guest.',
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - 48,
                ),
                child: IntrinsicHeight(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Spacer(),
                      const Icon(
                        Icons.local_pizza,
                        size: 80,
                        color: Color(0xFFFF6B2C),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'FoodieGo',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Fast. Fresh. Delivered.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 16, color: Colors.white70),
                      ),
                      const Spacer(),
                      if (_registerMode) ...[
                        TextField(
                          controller: _name,
                          textInputAction: TextInputAction.next,
                          textCapitalization: TextCapitalization.words,
                          style: const TextStyle(color: Colors.white),
                          decoration: _inputDecoration(
                            'Name',
                            Icons.person_outline,
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                      TextField(
                        controller: _email,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(
                          'Email',
                          Icons.email_outlined,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _password,
                        obscureText: true,
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) {
                          if (!_isLoading) {
                            _submitEmailAuth();
                          }
                        },
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(
                          'Password',
                          Icons.lock_outline,
                        ),
                      ),
                      const SizedBox(height: 14),
                      if (_isLoading)
                        const Center(
                          child: CircularProgressIndicator(
                            color: Color(0xFFFF6B2C),
                          ),
                        )
                      else ...[
                        ElevatedButton(
                          onPressed: _submitEmailAuth,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF6B2C),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: Text(
                            _registerMode ? 'Create account' : 'Sign in',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        TextButton(
                          onPressed: () =>
                              setState(() => _registerMode = !_registerMode),
                          child: Text(
                            _registerMode
                                ? 'Already have an account? Sign in'
                                : 'New here? Create an account',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        ElevatedButton.icon(
                          onPressed: _signInWithGoogle,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          icon: const Icon(
                            Icons.g_mobiledata,
                            size: 28,
                            color: Colors.blue,
                          ),
                          label: const Text(
                            'Continue with Google',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        TextButton(
                          onPressed: widget.onContinueAsGuest,
                          child: const Text(
                            'Explore as guest',
                            style: TextStyle(
                              color: Color(0xFFFF6B2C),
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 48),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white54),
      prefixIcon: Icon(icon, color: Colors.white54),
      filled: true,
      fillColor: const Color(0xFF1B1B1B),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFF2A2A2A)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFFFF6B2C), width: 1.4),
      ),
    );
  }
}
