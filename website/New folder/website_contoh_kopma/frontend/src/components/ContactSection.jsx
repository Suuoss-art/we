import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

const ContactSection = ({ data }) => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            OUR LOCATION
          </h2>
          <p className="text-gray-600 text-lg">
            Hubungi kami untuk informasi lebih lanjut
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-96 rounded-3xl overflow-hidden shadow-xl"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.2883847334347!2d110.40141931477493!3d-6.990394794988145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b4ec52229d7%3A0xc791d6abc9236c7e!2sKOPMA%20UNNES!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="KOPMA UNNES Location"
            />
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Get In Touch
              </h3>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600">
                      Gedung E5 Lantai 1, Kampus Sekaran, Gunungpati, Semarang, Jawa Tengah 50229
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <a href={`tel:${data.contact.whatsapp}`} className="text-emerald-600 hover:underline">
                      {data.contact.whatsapp}
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <a href={`mailto:${data.contact.email}`} className="text-emerald-600 hover:underline">
                      {data.contact.email}
                    </a>
                  </div>
                </motion.div>
              </div>

              <div className="mt-8 pt-8 border-t border-emerald-200">
                <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  <Button
                    asChild
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
                  >
                    <a href={data.contact.whatsapp.startsWith('+') ? `https://wa.me/${data.contact.whatsapp.replace('+', '')}` : data.contact.whatsapp} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
                  >
                    <a href={data.contact.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
                  >
                    <a href={data.contact.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-5 h-5" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
                  >
                    <a href={data.contact.youtube} target="_blank" rel="noopener noreferrer">
                      <Youtube className="w-5 h-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
