import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AppSession extends ChangeNotifier {
  bool _guest = false;
  bool _admin = false;
  bool _showRegister = false;

  bool get isGuest => _guest;
  bool get isAdmin => _admin;
  bool get showRegister => _showRegister;
  bool get isSignedIn => Supabase.instance.client.auth.currentUser != null;
  bool get canOrder => !_guest && isSignedIn;

  void enterGuest() {
    _guest = true;
    _admin = false;
    notifyListeners();
  }

  void enterAdmin() {
    _guest = false;
    _admin = true;
    notifyListeners();
  }

  void requireRegister() {
    _guest = false;
    _admin = false;
    _showRegister = true;
    notifyListeners();
  }

  void consumeRegisterIntent() {
    _showRegister = false;
  }

  void exit() {
    _guest = false;
    _admin = false;
    notifyListeners();
  }
}
