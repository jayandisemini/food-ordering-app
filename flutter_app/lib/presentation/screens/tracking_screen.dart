import 'package:flutter/material.dart';

class TrackingScreen extends StatelessWidget {
  const TrackingScreen({super.key, required this.order});

  final Map<String, dynamic> order;

  @override
  Widget build(BuildContext context) {
    final lat = ((order['track_lat'] as num?) ?? 6.9271).toDouble();
    final lng = ((order['track_lng'] as num?) ?? 79.8612).toDouble();
    return Scaffold(
      appBar: AppBar(title: const Text('Track order')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF1B1B1B),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Stack(children: [
                Positioned.fill(
                  child: CustomPaint(painter: _MapPainter()),
                ),
                const Align(
                  alignment: Alignment(0.1, -0.15),
                  child: Icon(Icons.delivery_dining,
                      color: Color(0xFFFF6B2C), size: 54),
                ),
                const Align(
                  alignment: Alignment(-0.65, 0.55),
                  child: Icon(Icons.home, color: Colors.white, size: 38),
                ),
              ]),
            ),
          ),
          const SizedBox(height: 16),
          ListTile(
            tileColor: const Color(0xFF1B1B1B),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            leading: const Icon(Icons.location_on, color: Color(0xFFFF6B2C)),
            title: Text(order['status'] as String? ?? 'placed'),
            subtitle: Text('Live location: $lat, $lng'),
          ),
        ]),
      ),
    );
  }
}

class _MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final road = Paint()
      ..color = Colors.white24
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;
    final path = Path()
      ..moveTo(size.width * .18, size.height * .78)
      ..quadraticBezierTo(size.width * .42, size.height * .52,
          size.width * .56, size.height * .38)
      ..quadraticBezierTo(size.width * .7, size.height * .24,
          size.width * .84, size.height * .18);
    canvas.drawPath(path, road);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
