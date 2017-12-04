#include <iostream>
#include <string>
#include <fstream>
#include <cmath>

using namespace std;

// static void toEulerAngle(const Quaterniond& q, double& roll, double& pitch, double& yaw)
void toEulerAngle(long double x, long double y, long double z, long double w, long double (&euler)[3])
{
	// roll (x-axis rotation)
	long double sinr = +2.0 * (w * x + y * z);
	long double cosr = +1.0 - 2.0 * (x * x + y * y);
	long double roll = atan2(sinr, cosr);

	// pitch (y-axis rotation)
	long double sinp = +2.0 * (w * y - z * x);
	long double pitch = asin(sinp);
    if (fabs(sinp) >= 1)
        long double pitch = copysign(M_PI / 2, sinp); // use 90 degrees if out of range

	// yaw (z-axis rotation)
	long double siny = +2.0 * (w * z + x * y);
	long double cosy = +1.0 - 2.0 * (y * y + z * z);  
	long double yaw = atan2(siny, cosy);
	
	euler[0] = roll;
	euler[1] = pitch;
	euler[2] = yaw;
}


int main() {
	string input_filename  = "coba.txt";
	string output_filename = "eule.txt";

	ifstream infile("20171012_1515 - Orientation Comparison_old.txt");
	ofstream output_file;
	output_file.open ("20171012_1515 - Orientation Comparison_old_euler.csv");
	
	long double x, y , z, w;
	long double euler[3];

	while (infile >> x >> y >> z >> w) {
		toEulerAngle(x, y, z, w, euler);
		output_file << euler[0] << "," << euler[1] << "," << euler[2] << endl;
	}

	cout << "finish";

	return 0;
}